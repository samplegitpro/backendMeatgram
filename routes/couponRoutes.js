const express = require('express');
const router = express.Router();
const userAuthMiddleware = require('../middleware/userAuthMidlleware')
const couponController = require('../controllers/couponController');

router.post('/apply',userAuthMiddleware, couponController.applyCoupon);


module.exports = router;
