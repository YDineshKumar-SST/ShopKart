const express = require("express");
const router = express.Router();
const { addToCart, getCart, updateQuantity, removeFromCart } = require("../controllers/cart.controller");

const protect = require("../middleware/auth.middleware");

router.post("/:productId", protect, addToCart);
router.get("/", protect, getCart);
router.patch("/:productId", protect, updateQuantity);
router.delete("/:productId", protect, removeFromCart);

module.exports = router;