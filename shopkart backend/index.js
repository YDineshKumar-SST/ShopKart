const express = require('express');
const mongoose = require('mongoose');
const productRoutes = require('./routes/product.routes');
const customerRoutes = require('./routes/customer.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");

const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: [process.env.frontend_url, "https://shopkart-eight-roan.vercel.app"],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Saare routes yahan setup kiye hain
app.use('/products', productRoutes);
app.use('/customers', customerRoutes);
app.use('/wishlist', wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("database connected successfully")
    })
    .catch((error) => {
        console.log("database not connected", error)
    });

app.listen(port, () => {
    console.log('server shuru ho gaya hai')
});