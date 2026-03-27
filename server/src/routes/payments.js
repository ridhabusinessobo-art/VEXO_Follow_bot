const express = require('express');
const { body } = require('express-validator');
const { processPayment, confirmPayment, getTransactions, getBalance } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post(
  '/deposit',
  [
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
    body('method').isIn(['credit_card', 'paypal', 'stripe', 'crypto', 'bank_transfer']),
  ],
  processPayment
);

router.post('/confirm', confirmPayment);
router.get('/transactions', getTransactions);
router.get('/balance', getBalance);

module.exports = router;
