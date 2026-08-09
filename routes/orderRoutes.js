const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', orderController.createOrder);
router.post('/:orderId/accept', orderController.acceptOrder);
router.post('/:orderId/finish', orderController.finishOrder);

module.exports = router;
