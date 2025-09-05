const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  masterPassword: {
    type: String,
    required: [true, 'Master password is required']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  resetPasswordOTP: {
    type: String
  },
  resetPasswordOTPExpires: {
    type: Date
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorOTP: {
    type: String
  },
  twoFactorOTPExpires: {
    type: Date
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  securityAlerts: {
    type: Boolean,
    default: true
  },
  autoLogout: {
    type: Number,
    default: 15 // minutes
  },
  masterPasswordAttempts: {
    type: Number,
    default: 0
  },
  lastMasterPasswordAttempt: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') && !this.isModified('masterPassword')) {
    return next();
  }

  try {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }

    if (this.isModified('masterPassword')) {
      const salt = await bcrypt.genSalt(12);
      this.masterPassword = await bcrypt.hash(this.masterPassword, salt);
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Compare master password method
userSchema.methods.compareMasterPassword = async function(candidateMasterPassword) {
  return await bcrypt.compare(candidateMasterPassword, this.masterPassword);
};

// Get user's full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Generate password reset OTP
userSchema.methods.generatePasswordResetOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  
  this.resetPasswordOTP = otp;
  this.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return otp;
};

// Generate 2FA OTP
userSchema.methods.generate2FAOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  
  this.twoFactorOTP = otp;
  this.twoFactorOTPExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
  
  return otp;
};

module.exports = mongoose.model('User', userSchema);