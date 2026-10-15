const express  = require('express')
const router = express.Router()

const { registerCustomer, loginCustomer, getCustomerProfile, logoutCustomer, updateCustomerProfile } = require('../controllers/customer.controller');
const protect = require('../middleware/auth.middleware');

router.post('/register', registerCustomer)
router.post('/login', loginCustomer)
router.get('/me', protect, getCustomerProfile);
router.post('/logout', protect, logoutCustomer);
router.put('/update', protect, updateCustomerProfile);
module.exports = router