const OTP = require('../models/otp.model');
const User = require('../models/user.model');
const { sendOTP, sendVerificationSuccess } = require('../services/email.service');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateOTP();
    
    // Save OTP to database
    await OTP.create({ email, otp });
    
    // Send OTP via email
    const emailSent = await sendOTP(email, otp);
    
    if (emailSent) {
      res.status(200).json({ message: 'OTP sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email });
    
    const otp = generateOTP();
    
    // Save new OTP to database
    await OTP.create({ email, otp });
    
    // Send new OTP via email
    const emailSent = await sendOTP(email, otp, true);
    
    if (emailSent) {
      res.status(200).json({ message: 'New OTP sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send new OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const validOTP = await OTP.findOne({ email, otp });
    
    if (!validOTP) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // Delete the used OTP
    await OTP.deleteOne({ email, otp });
    
    // Update user's email verification status
    await User.findOneAndUpdate({ email }, { isEmailVerified: true });

    // Send verification success email
    await sendVerificationSuccess(email);
    
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendVerificationOTP,
  resendVerificationOTP,
  verifyOTP
};