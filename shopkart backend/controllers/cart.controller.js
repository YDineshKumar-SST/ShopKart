const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const addToCart = async (req, res) => {
    try {
        const productId = req.params.productId;
        const customerId = req.customer ? req.customer._id : req.user._id;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const customer = await Customer.findById(customerId);
        if (!customer.cart) customer.cart = [];

        const cartItemIndex = customer.cart.findIndex(item => item.product.toString() === productId);

        if (cartItemIndex > -1) {
            if (customer.cart[cartItemIndex].quantity + 1 > product.stock) {
                return res.status(400).json({ success: false, message: "Cannot exceed available stock" });
            }
            customer.cart[cartItemIndex].quantity += 1;
        } else {
            if (product.stock < 1) {
                return res.status(400).json({ success: false, message: "Product is out of stock" });
            }
            customer.cart.push({ product: productId, quantity: 1 });
        }

        await customer.save();
        res.status(200).json({ success: true, message: "Cart updated", cart: customer.cart });
    } catch (error) {
        console.error("Add to Cart Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCart = async (req, res) => {
    try {
        const customerId = req.customer ? req.customer._id : req.user._id;
        const customer = await Customer.findById(customerId).populate({
            path: "cart.product",
            select: "name price category image stock"
        });

        if (!customer) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({ success: true, cart: customer.cart || [] });
    } catch (error) {
        console.error("Get Cart Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateQuantity = async (req, res) => {
    try {
        const productId = req.params.productId;
        const { quantity } = req.body;
        const customerId = req.customer ? req.customer._id : req.user._id;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        if (quantity > product.stock) {
            return res.status(400).json({ success: false, message: "Quantity exceeds available stock" });
        }

        const customer = await Customer.findById(customerId);
        const cartItem = customer.cart.find(item => item.product.toString() === productId);

        if (!cartItem) return res.status(404).json({ success: false, message: "Product not in cart" });

        cartItem.quantity = quantity;
        await customer.save();

        res.status(200).json({ success: true, message: "Quantity updated", cart: customer.cart });
    } catch (error) {
        console.error("Update Quantity Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const productId = req.params.productId;
        const customerId = req.customer ? req.customer._id : req.user._id;

        const customer = await Customer.findById(customerId);
        
        const itemExists = customer.cart.some(item => item.product.toString() === productId);
        if (!itemExists) return res.status(404).json({ success: false, message: "Product not in cart" });

        customer.cart = customer.cart.filter(item => item.product.toString() !== productId);
        await customer.save();

        res.status(200).json({ success: true, message: "Product removed from cart", cart: customer.cart });
    } catch (error) {
        console.error("Remove from Cart Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { addToCart, getCart, updateQuantity, removeFromCart };