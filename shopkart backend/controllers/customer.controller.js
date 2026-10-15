const Customer = require('../models/customer.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerCustomer = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;
        
        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ message: "All fields are mandatory" });
        }
        
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(409).json({ message: "already registered" });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newCustomer = new Customer({
            fullName, 
            email, 
            password: hashedPassword,
            phone 
        });
        
        await newCustomer.save();
        
        res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: {
                _id: newCustomer._id,
                fullName: newCustomer.fullName,
                email: newCustomer.email,
                phone: newCustomer.phone
            }
        });
    } catch(error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
}

const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Email check karega
        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        
        const isPasswordMatch = await bcrypt.compare(password, customer.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        
        const token = jwt.sign(
            { id: customer._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );
        
        customer.password = undefined;

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 
        }).status(200).json({
            success: true,
            message: "Login successful",
            customer
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error in login", error: error.message });
    }
};

const getCustomerProfile = async (req, res) => {
    try {
        res.status(200).json({ success: true, customer: req.user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const logoutCustomer = async (req, res) => {
    try {
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0)
        });

        res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error in logout", error: error.message });
    }
};
const updateCustomerProfile = async (req, res) => {
    try {
        const { fullName, phone, profileImage } = req.body;
        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.user._id,
            { fullName, phone, profileImage },
            { new: true } 
        ).select('-password');

        res.status(200).json({ success: true, customer: updatedCustomer });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating profile" });
    }
};

module.exports = {
    registerCustomer, 
    loginCustomer, 
    getCustomerProfile, 
    logoutCustomer, 
    updateCustomerProfile 
}