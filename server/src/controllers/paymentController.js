const User = require('../models/User');
const Transaction = require('../models/Transaction');

const generateRef = () => Math.random().toString(36).substring(2, 14).toUpperCase();

const processPayment = async (req, res, next) => {
  try {
    const { amount, method } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    const validMethods = ['credit_card', 'paypal', 'stripe', 'crypto', 'bank_transfer'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    const reference = generateRef();
    const transaction = await Transaction.create({
      userId: req.user._id,
      type: 'deposit',
      amount,
      method,
      status: 'pending',
      reference,
    });

    let paymentData = { reference, transaction };

    if (method === 'crypto') {
      paymentData.walletAddress = process.env.CRYPTO_WALLET_ADDRESS;
      paymentData.instructions = `Send exactly $${amount} USD equivalent to the wallet address above.`;
    } else if (method === 'bank_transfer') {
      paymentData.bankAccount = process.env.BANK_ACCOUNT_NUMBER;
      paymentData.instructions = `Transfer $${amount} USD and use reference: ${reference}`;
    } else if (method === 'paypal') {
      paymentData.paypalEmail = process.env.PAYPAL_EMAIL || process.env.PAYPAL_CLIENT_ID;
      paymentData.instructions = `Send $${amount} USD to the PayPal email above.`;
    } else {
      // For stripe/credit_card - in production integrate Stripe PaymentIntent
      paymentData.instructions = `Please complete payment via ${method}.`;
    }

    res.status(201).json(paymentData);
  } catch (err) {
    next(err);
  }
};

const confirmPayment = async (req, res, next) => {
  try {
    const { reference } = req.body;
    const transaction = await Transaction.findOne({
      userId: req.user._id,
      reference,
      status: 'pending',
    });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found or already processed' });
    }
    transaction.status = 'completed';
    await transaction.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { balance: transaction.amount } });
    res.json({ message: 'Payment confirmed', transaction });
  } catch (err) {
    next(err);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const filter = { userId: req.user._id };
    if (req.query.type) filter.type = req.query.type;
    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments(filter),
    ]);
    res.json({ transactions, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

const getBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('balance');
    res.json({ balance: user.balance });
  } catch (err) {
    next(err);
  }
};

module.exports = { processPayment, confirmPayment, getTransactions, getBalance };
