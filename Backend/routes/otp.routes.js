const express = require('express');
const router = express.Router();
const { 
  sendVerificationOTP, 
  resendVerificationOTP, 
  verifyOTP 
} = require('../controllers/otp.controller');

router.post('/send', sendVerificationOTP);
router.post('/resend', resendVerificationOTP);
router.post('/verify', verifyOTP);

module.exports = router;