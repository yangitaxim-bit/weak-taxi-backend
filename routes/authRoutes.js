const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/driver/login', authController.driverLogin);
router.post('/client/login', authController.clientLogin);

module.exports = router;
