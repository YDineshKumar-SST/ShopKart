const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/order.model');
const Customer = require('../models/customer.model');

// Helper to initialize Razorpay safely
const getRazorpayInstance = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId.includes('placeholder') || keySecret.includes('placeholder')) {
        return null;
    }

    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret
    });
};

// 1. Get Razorpay public Key ID for the frontend
const getRazorpayKey = async (req, res) => {
    try {
        const keyId = process.env.RAZORPAY_KEY_ID || "";
        res.status(200).json({
            success: true,
            keyId: keyId
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Create Razorpay order
const createRazorpayOrder = async (req, res) => {
    try {
        const customerId = req.user ? req.user._id : (req.customer ? req.customer._id : null);
        if (!customerId) {
            return res.status(401).json({ success: false, message: "Unauthorized user" });
        }

        const { shippingAddress } = req.body;
        if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.pincode) {
            return res.status(400).json({
                success: false,
                message: "Please provide a complete shipping address (Name, Phone, Address, City, State, Pincode)"
            });
        }

        const customer = await Customer.findById(customerId).populate({
            path: 'cart.product',
            select: 'name price image stock'
        });

        if (!customer || !customer.cart || customer.cart.length === 0) {
            return res.status(400).json({ success: false, message: "Your cart is empty" });
        }

        // Calculate total amount & prepare items list
        let totalAmount = 0;
        const orderItems = [];

        for (const item of customer.cart) {
            if (!item.product) continue;
            totalAmount += item.product.price * item.quantity;
            orderItems.push({
                product: item.product._id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                image: item.product.image
            });
        }

        if (totalAmount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid order amount" });
        }

        const razorpayInstance = getRazorpayInstance();
        if (!razorpayInstance) {
            return res.status(400).json({
                success: false,
                message: "Razorpay API keys are not configured yet in backend .env file. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
            });
        }

        // Razorpay expects amount in paise (1 INR = 100 paise)
        const rzpOptions = {
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            receipt: `rcpt_${Date.now().toString().slice(-8)}`
        };

        const rzpOrder = await razorpayInstance.orders.create(rzpOptions);

        // Save order in database with pending status
        const newOrder = new Order({
            customer: customerId,
            items: orderItems,
            totalAmount: totalAmount,
            shippingAddress: shippingAddress,
            paymentMethod: "RAZORPAY",
            paymentStatus: "pending",
            orderStatus: "processing",
            razorpayOrderId: rzpOrder.id
        });

        await newOrder.save();

        res.status(201).json({
            success: true,
            orderId: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            dbOrderId: newOrder._id
        });
    } catch (error) {
        console.error("Create Razorpay Order Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create Razorpay order"
        });
    }
};

// 3. Verify Razorpay Payment Signature
const verifyPayment = async (req, res) => {
    try {
        const customerId = req.user ? req.user._id : (req.customer ? req.customer._id : null);
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            dbOrderId
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !dbOrderId) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification parameters"
            });
        }

        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) {
            return res.status(500).json({
                success: false,
                message: "RAZORPAY_KEY_SECRET is not configured on server"
            });
        }

        // Verify HMAC SHA256 signature
        const hmac = crypto.createHmac("sha256", keySecret);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generatedSignature = hmac.digest("hex");

        const order = await Order.findById(dbOrderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (generatedSignature === razorpay_signature) {
            // Payment verified!
            order.paymentStatus = "paid";
            order.orderStatus = "confirmed";
            order.razorpayPaymentId = razorpay_payment_id;
            order.razorpaySignature = razorpay_signature;
            await order.save();

            // Clear the customer's cart
            await Customer.findByIdAndUpdate(customerId, { $set: { cart: [] } });

            return res.status(200).json({
                success: true,
                message: "Payment successfully verified! Your order is confirmed.",
                order: order
            });
        } else {
            // Verification failed
            order.paymentStatus = "failed";
            await order.save();

            return res.status(400).json({
                success: false,
                message: "Payment signature verification failed. Transaction flagged as invalid."
            });
        }
    } catch (error) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to verify payment"
        });
    }
};

// 4. Get Customer Orders history
const getMyOrders = async (req, res) => {
    try {
        const customerId = req.user ? req.user._id : (req.customer ? req.customer._id : null);
        const orders = await Order.find({ customer: customerId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            orders: orders
        });
    } catch (error) {
        console.error("Get My Orders Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Get Single Order Detail
const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const customerId = req.user ? req.user._id : (req.customer ? req.customer._id : null);

        const order = await Order.findOne({ _id: orderId, customer: customerId });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getRazorpayKey,
    createRazorpayOrder,
    verifyPayment,
    getMyOrders,
    getOrderById
};
