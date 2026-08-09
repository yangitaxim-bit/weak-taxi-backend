const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/profile', driverController.getProfile);
router.post('/location', driverController.updateLocation);
router.post('/status', driverController.updateStatus);

module.exports = router;
