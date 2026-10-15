const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');
const protect = async (req, res, next) => {
  try{
    const token = req.cookies.token;
    if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Not authorized, token missing" 
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await Customer.findById(decoded.id).select('-password');;
        if(!req.user){
            return res.status(401).json({ 
                success: false, 
                message: "User not found" 
            });
        }
        next();
  }catch(error){  
    return res.status(401).json({ 
            success: false, 
            message: "Not authorized, token failed", 
            error: error.message 
        });
    }
}
module.exports = protect;