const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendOTP = async (email, otp, isResend = false) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${isResend ? 'Resent: ' : ''}Email Verification OTP`,
      html: `
        <h1>Email Verification</h1>
        <p>Your ${isResend ? 'new ' : ''}OTP for email verification is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 5 minutes.</p>
        ${isResend ? '<p>Previous OTP has been invalidated.</p>' : ''}
      `
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

const sendVerificationSuccess = async (email) => {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification Successful',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <h1 style="color: #4CAF50;">Email Verification Successful! 🎉</h1>
            <p>Your email address has been successfully verified. You can now use all features of our service.</p>
            <p>Thank you for choosing our platform!</p>
            <hr>
            <p style="font-size: 12px; color: #666;">This is an automated message, please do not reply.</p>
          </div>
        `
      });
      return true;
    } catch (error) {
      console.error('Verification success email error:', error);
      return false;
    }
  };
  

module.exports = { sendOTP, sendVerificationSuccess };