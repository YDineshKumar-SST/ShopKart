const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const {
    getRazorpayKey,
    createRazorpayOrder,
    verifyPayment,
    getMyOrders,
    getOrderById
} = require('../controllers/order.controller');

// Get Razorpay Key (can be accessed by logged in users)
router.get('/razorpay-key', protect, getRazorpayKey);

// Create order on Razorpay
router.post('/create', protect, createRazorpayOrder);

// Verify Razorpay payment signature
router.post('/verify', protect, verifyPayment);

// Get order history
router.get('/my-orders', protect, getMyOrders);

// Get order by ID
router.get('/:orderId', protect, getOrderById);

module.exports = router;
