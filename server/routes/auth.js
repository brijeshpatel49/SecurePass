const express = require('express');
const {
  register,
  login,
  getMe,
  verifyMasterPassword,
  forgotPassword,
  resendRegistrationOTP,
  verifyRegistrationOTP,
  verifyOTP,
  resetPassword,
  enable2FA,
  verify2FASetup,
  disable2FA
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/resend-registration-otp', resendRegistrationOTP);
router.post('/verify-registration-otp', verifyRegistrationOTP);
router.post('/login', validateLogin, login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/verify-master', protect, verifyMasterPassword);

// 2FA routes
router.post('/enable-2fa', protect, enable2FA);
router.post('/verify-2fa-setup', protect, verify2FASetup);
router.post('/disable-2fa', protect, disable2FA);

module.exports = router;