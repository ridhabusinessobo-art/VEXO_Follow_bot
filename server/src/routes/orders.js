const express = require('express');
const { body } = require('express-validator');
const { createOrder, getOrders, getOrder, cancelOrder, syncOrderStatus } = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { orderLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(authenticate);

router.get('/', getOrders);
router.post(
  '/',
  orderLimiter,
  [
    body('serviceId').notEmpty().withMessage('Service ID is required'),
    body('link').notEmpty().trim().withMessage('Link is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  ],
  createOrder
);
router.get('/:id', getOrder);
router.delete('/:id', cancelOrder);
router.post('/:id/sync', syncOrderStatus);

module.exports = router;
