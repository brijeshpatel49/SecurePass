const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const emailService = require('../utils/emailService');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password, masterPassword, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Generate OTP
    const OTP = require('../models/OTP');
    const otp = OTP.generateOTP();

    // Hash passwords before storing in OTP
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);
    const hashedMasterPassword = await bcrypt.hash(masterPassword, 12);

    // Store registration data with OTP
    await OTP.create({
      email,
      otp,
      type: 'registration',
      userData: {
        firstName,
        lastName,
        password: hashedPassword,
        masterPassword: hashedMasterPassword
      }
    });

    // Send OTP email
    await emailService.sendSimpleOTP(email, otp, 'registration');

    res.status(200).json({
      success: true,
      message: 'Registration initiated. Please check your email for OTP verification.',
      email: email
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password, twoFactorOTP } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!twoFactorOTP) {
        // Generate and send 2FA OTP
        const otp = user.generate2FAOTP();
        await user.save();
        
        const emailResult = await emailService.send2FAOTP(email, otp);
        if (!emailResult.success) {
          return res.status(500).json({
            success: false,
            message: 'Failed to send 2FA code'
          });
        }

        return res.status(200).json({
          success: true,
          requiresTwoFactor: true,
          message: 'Two-factor authentication code sent to your email'
        });
      }

      // Verify 2FA OTP
      if (user.twoFactorOTP !== twoFactorOTP || user.twoFactorOTPExpires < Date.now()) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired two-factor authentication code'
        });
      }

      // Clear used OTP
      user.twoFactorOTP = undefined;
      user.twoFactorOTPExpires = undefined;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          twoFactorEnabled: user.twoFactorEnabled
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -masterPassword');
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Verify master password
// @route   POST /api/auth/verify-master
// @access  Private
const verifyMasterPassword = async (req, res) => {
  try {
    const { masterPassword } = req.body;

    if (!masterPassword) {
      return res.status(400).json({
        success: false,
        message: 'Master password is required'
      });
    }

    const user = await User.findById(req.user.id);
    const isValidMasterPassword = await user.compareMasterPassword(masterPassword);

    if (!isValidMasterPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid master password'
      });
    }

    res.json({
      success: true,
      message: 'Master password verified'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address'
      });
    }

    // Generate OTP
    const OTP = require('../models/OTP');
    const otp = OTP.generateOTP();

    // Remove any existing password reset OTPs for this email
    await OTP.deleteMany({
      email,
      type: 'password_reset'
    });

    // Store new password reset OTP
    await OTP.create({
      email,
      otp,
      type: 'password_reset'
    });

    // Send reset email
    await emailService.sendSimpleOTP(email, otp, 'password_reset');

    res.json({
      success: true,
      message: 'Password reset OTP sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Resend OTP for registration
// @route   POST /api/auth/resend-registration-otp
// @access  Public
const resendRegistrationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const OTP = require('../models/OTP');
    
    // Find existing registration OTP record (including used ones in case of previous failures)
    let existingOtpRecord = await OTP.findOne({
      email,
      type: 'registration'
    }).sort({ createdAt: -1 }); // Get the most recent one

    if (!existingOtpRecord) {
      return res.status(400).json({
        success: false,
        message: 'No pending registration found for this email'
      });
    }

    // Check if user already exists (registration was completed)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Registration already completed. Please login instead.'
      });
    }

    // Generate new OTP
    const newOtp = OTP.generateOTP();
    
    // Update the existing record with new OTP and reset all fields
    existingOtpRecord.otp = newOtp;
    existingOtpRecord.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    existingOtpRecord.attempts = 0; // Reset attempts
    existingOtpRecord.isUsed = false; // Reset used status
    await existingOtpRecord.save();

    // Send new OTP email
    await emailService.sendSimpleOTP(email, newOtp, 'registration');

    res.status(200).json({
      success: true,
      message: 'New verification code sent to your email'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resending OTP'
    });
  }
};

// @desc    Verify OTP for registration
// @route   POST /api/auth/verify-registration-otp
// @access  Public
const verifyRegistrationOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const OTP = require('../models/OTP');
    const otpRecord = await OTP.findOne({
      email,
      type: 'registration',
      isUsed: false
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'No pending registration found for this email'
      });
    }

    // First verify OTP without marking as used
    if (otpRecord.isUsed) {
      return res.status(400).json({
        success: false,
        message: 'OTP has already been used'
      });
    }
    
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }
    
    if (otpRecord.attempts >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum OTP attempts exceeded'
      });
    }
    
    // Check OTP match first before incrementing attempts
    if (otpRecord.otp !== otp.toString()) {
      // Increment attempts only on wrong OTP
      otpRecord.attempts += 1;
      await otpRecord.save(); // Save attempt count
      

      
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: otpRecord.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user with stored data
    const user = await User.create({
      email: otpRecord.email,
      firstName: otpRecord.userData.firstName,
      lastName: otpRecord.userData.lastName,
      password: otpRecord.userData.password,
      masterPassword: otpRecord.userData.masterPassword,
      isEmailVerified: true
    });

    // Only mark OTP as used after successful user creation
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.firstName);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration completed successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        isEmailVerified: user.isEmailVerified
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Verify OTP for password reset
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const OTP = require('../models/OTP');
    const otpRecord = await OTP.findOne({
      email,
      type: 'password_reset',
      isUsed: false
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'No password reset request found for this email'
      });
    }

    // Check OTP manually instead of using the method that marks as used
    if (otpRecord.isUsed) {
      return res.status(400).json({
        success: false,
        message: 'OTP has already been used'
      });
    }
    
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }
    
    if (otpRecord.attempts >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum OTP attempts exceeded'
      });
    }
    
    if (otpRecord.otp !== otp.toString()) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      

      
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }
    
    // Mark as verified but not used (so it can be used for password reset)
    otpRecord.isUsed = true;
    await otpRecord.save();

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        email: email,
        verified: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and password are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const OTP = require('../models/OTP');
    const otpRecord = await OTP.findOne({
      email,
      type: 'password_reset',
      isUsed: true,
      otp: otp.toString(),
      passwordResetUsed: false
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP or password already reset. Please verify OTP first.'
      });
    }

    // Check if OTP was verified recently (within 10 minutes of verification)
    const timeSinceVerification = new Date() - otpRecord.updatedAt;
    const maxTimeAfterVerification = 10 * 60 * 1000; // 10 minutes
    
    if (timeSinceVerification > maxTimeAfterVerification) {
      return res.status(400).json({
        success: false,
        message: 'OTP verification has expired. Please request a new OTP.'
      });
    }

    // Mark OTP as used for password reset to prevent reuse
    otpRecord.passwordResetUsed = true;
    await otpRecord.save();

    // Set new password
    user.password = password;
    await user.save();

    // Generate new token
    const authToken = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password reset successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName
        },
        token: authToken
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Enable 2FA
// @route   POST /api/auth/enable-2fa
// @access  Private
const enable2FA = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Two-factor authentication is already enabled'
      });
    }

    // Send test OTP to verify email works
    const testOTP = user.generate2FAOTP();
    await user.save();
    
    const emailResult = await emailService.send2FAOTP(user.email, testOTP);
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send test code. Please check your email settings.'
      });
    }

    res.json({
      success: true,
      message: 'Test code sent to your email. Please verify to enable 2FA.',
      requiresVerification: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Verify and complete 2FA setup
// @route   POST /api/auth/verify-2fa-setup
// @access  Private
const verify2FASetup = async (req, res) => {
  try {
    const { otp } = req.body;
    
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Verify OTP
    if (user.twoFactorOTP !== otp || user.twoFactorOTPExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    user.twoFactorOTP = undefined;
    user.twoFactorOTPExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Two-factor authentication enabled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Disable 2FA
// @route   POST /api/auth/disable-2fa
// @access  Private
const disable2FA = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Two-factor authentication is not enabled'
      });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorOTP = undefined;
    user.twoFactorOTPExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Two-factor authentication disabled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
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
};