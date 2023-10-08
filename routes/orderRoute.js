// routes/orderRoutes.js
// routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const userAuthMiddleware = require('../middleware/userAuthMidlleware');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware'); // Import admin auth middleware
const { getUserOrders, getAllOrders, updateOrderStatus, cancelOrder, getTodayOrders,updateOrder } = require('../controllers/orderController'); // Import the new controller function

// User routes
router.get('/user/:userId', getUserOrders);

// Admin routes
router.get('/admin', getAllOrders);
router.put('/admin/:orderId', updateOrderStatus);
router.put('/cancel-order/:orderId', userAuthMiddleware, cancelOrder);
router.put('/admin/updateOrder/:orderId', adminAuthMiddleware, updateOrder); // New route for fetching orders placed today
router.get('/admin/today', adminAuthMiddleware, getTodayOrders); // New route for fetching orders placed today

module.exports = router;

