const express = require('express');
const { getServices, getService, syncServices, createService, updateService } = require('../controllers/serviceController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getServices);
router.get('/:id', getService);
router.post('/sync', authenticate, requireAdmin, syncServices);
router.post('/', authenticate, requireAdmin, createService);
router.put('/:id', authenticate, requireAdmin, updateService);

module.exports = router;
