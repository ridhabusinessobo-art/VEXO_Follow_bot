const express = require('express');
const {
  getUsers, getUser, updateUser, banUser,
  getAdminOrders, updateOrder,
  getDashboardStats, getAdminTransactions, approveDeposit,
} = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboardStats);

router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.post('/users/:id/ban', banUser);

router.get('/orders', getAdminOrders);
router.put('/orders/:id', updateOrder);

router.get('/transactions', getAdminTransactions);
router.post('/transactions/:id/approve', approveDeposit);

module.exports = router;
