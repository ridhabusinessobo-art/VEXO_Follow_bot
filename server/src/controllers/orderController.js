const Order = require('../models/Order');
const Service = require('../models/Service');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const smmApi = require('../config/smmApi');

const createOrder = async (req, res, next) => {
  try {
    const { serviceId, link, quantity } = req.body;
    const service = await Service.findById(serviceId);
    if (!service || !service.active) {
      return res.status(404).json({ message: 'Service not found or inactive' });
    }
    if (quantity < service.min || quantity > service.max) {
      return res.status(400).json({
        message: `Quantity must be between ${service.min} and ${service.max}`,
      });
    }
    const price = (service.rate / 1000) * quantity;
    const user = await User.findById(req.user._id);
    if (user.balance < price) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const smmOrder = await smmApi.createOrder({
      service: service.externalId,
      link,
      quantity,
    });

    user.balance -= price;
    await user.save({ validateBeforeSave: false });

    const order = await Order.create({
      userId: req.user._id,
      serviceId,
      link,
      quantity,
      price,
      status: 'processing',
      externalOrderId: String(smmOrder.order),
    });

    await Transaction.create({
      userId: req.user._id,
      type: 'order',
      amount: -price,
      method: 'system',
      status: 'completed',
      orderId: order._id,
      reference: String(smmOrder.order),
    });

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const filter = { userId: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    const [orders, total] = await Promise.all([
      Order.find(filter).populate('serviceId', 'name category').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id }).populate('serviceId', 'name category');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled' });
    }
    if (order.externalOrderId) {
      await smmApi.cancelOrder(order.externalOrderId).catch((err) => {
        console.warn(`SMM API cancel failed for order ${order.externalOrderId}:`, err.message);
      });
    }
    order.status = 'cancelled';
    await order.save();

    await User.findByIdAndUpdate(order.userId, { $inc: { balance: order.price } });
    await Transaction.create({
      userId: order.userId,
      type: 'refund',
      amount: order.price,
      method: 'system',
      status: 'completed',
      orderId: order._id,
    });

    res.json({ message: 'Order cancelled and refunded', order });
  } catch (err) {
    next(err);
  }
};

const syncOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.externalOrderId) return res.json({ order });

    const status = await smmApi.getOrderStatus(order.externalOrderId);
    const statusMap = {
      Pending: 'pending',
      Processing: 'processing',
      'In progress': 'processing',
      Completed: 'completed',
      Partial: 'partial',
      Cancelled: 'cancelled',
    };
    order.status = statusMap[status.status] || order.status;
    if (status.start_count !== undefined) order.startCount = status.start_count;
    if (status.remains !== undefined) order.remains = status.remains;
    await order.save();
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getOrders, getOrder, cancelOrder, syncOrderStatus };
