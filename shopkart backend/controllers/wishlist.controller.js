const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const addToWishlist = async (req, res) => {
    try {
        const productId = req.params.productId;
        
        const customerId = req.customer ? req.customer._id : req.user._id; 

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const customer = await Customer.findById(customerId);

        if (!customer.wishlist) {
            customer.wishlist = [];
        }

        if (customer.wishlist.includes(productId)) {
            return res.status(409).json({ success: false, message: "Product already in wishlist" });
        }

        customer.wishlist.push(productId);
        await customer.save();

        res.status(200).json({ success: true, message: "Product added to wishlist" });
    } catch (error) {
        console.error("Add to Wishlist Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getWishlist = async (req, res) => {
    try {
        const customerId = req.customer ? req.customer._id : req.user._id;

        const customer = await Customer.findById(customerId).populate({
            path: "wishlist",
            select: "name price category image stock"
        });

        if (!customer) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            count: customer.wishlist ? customer.wishlist.length : 0,
            wishlist: customer.wishlist || []
        });
    } catch (error) {
        console.error("Get Wishlist Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const productId = req.params.productId;
        const customerId = req.customer ? req.customer._id : req.user._id;

        const customer = await Customer.findById(customerId);

        if (!customer.wishlist || !customer.wishlist.includes(productId)) {
            return res.status(404).json({ success: false, message: "Product not found in wishlist" });
        }

        customer.wishlist = customer.wishlist.filter(id => id.toString() !== productId);
        await customer.save();

        res.status(200).json({ success: true, message: "Product removed from wishlist" });
    } catch (error) {
        console.error("Remove Wishlist Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { 
    addToWishlist, 
    getWishlist, 
    removeFromWishlist 
};