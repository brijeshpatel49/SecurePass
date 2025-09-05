const User = require('../models/User');
const Password = require('../models/Password');

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;

    // Email updates are not allowed for security reasons
    if (email && email !== req.user.email) {
      return res.status(400).json({
        success: false,
        message: 'Email address cannot be changed for security reasons'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(firstName && { firstName }),
        ...(lastName && { lastName })
        // Email is intentionally excluded from updates
      },
      { new: true, runValidators: true }
    ).select('-password -masterPassword');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user password
// @route   PUT /api/user/password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update master password
// @route   PUT /api/user/master-password
// @access  Private
const updateMasterPassword = async (req, res) => {
  try {
    const { currentMasterPassword, newMasterPassword } = req.body;

    if (!currentMasterPassword || !newMasterPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current master password and new master password are required'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Verify current master password
    const isCurrentMasterPasswordValid = await user.compareMasterPassword(currentMasterPassword);
    if (!isCurrentMasterPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current master password is incorrect'
      });
    }

    // Update master password
    user.masterPassword = newMasterPassword;
    await user.save();

    // Note: In a real application, you would need to re-encrypt all passwords with the new master password
    // This is a complex operation that requires decrypting with old master password and re-encrypting with new one

    res.json({
      success: true,
      message: 'Master password updated successfully. Please re-encrypt your passwords.'
    });
  } catch (error) {
    console.error('Update master password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user settings
// @route   GET /api/user/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('twoFactorEnabled emailNotifications securityAlerts autoLogout');
    
    // Get password statistics
    const totalPasswords = await Password.countDocuments({ userId: req.user.id });
    const favoritePasswords = await Password.countDocuments({ userId: req.user.id, isFavorite: true });
    
    // Get category statistics
    const categoryStats = await Password.aggregate([
      { $match: { userId: req.user.id } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const categories = {};
    categoryStats.forEach(stat => {
      categories[stat._id || 'uncategorized'] = stat.count;
    });
    
    // Get tag statistics
    const tagStats = await Password.aggregate([
      { $match: { userId: req.user.id } },
      { $unwind: { path: '$tags', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $match: { _id: { $ne: null } } }
    ]);

    res.json({
      success: true,
      data: {
        settings: {
          twoFactorEnabled: user.twoFactorEnabled,
          emailNotifications: user.emailNotifications,
          securityAlerts: user.securityAlerts,
          autoLogout: user.autoLogout,
          totalPasswords,
          favoritePasswords,
          totalCategories: Object.keys(categories).length,
          totalTags: tagStats.length
        }
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user settings
// @route   PUT /api/user/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const { twoFactorEnabled, emailNotifications, securityAlerts, autoLogout } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(typeof twoFactorEnabled === 'boolean' && { twoFactorEnabled }),
        ...(typeof emailNotifications === 'boolean' && { emailNotifications }),
        ...(typeof securityAlerts === 'boolean' && { securityAlerts }),
        ...(autoLogout && { autoLogout })
      },
      { new: true, runValidators: true }
    ).select('twoFactorEnabled emailNotifications securityAlerts autoLogout');

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        settings: {
          twoFactorEnabled: user.twoFactorEnabled,
          emailNotifications: user.emailNotifications,
          securityAlerts: user.securityAlerts,
          autoLogout: user.autoLogout
        }
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/user/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const { password, masterPassword } = req.body;

    if (!password || !masterPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and master password are required to delete account'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Verify both passwords
    const isPasswordValid = await user.comparePassword(password);
    const isMasterPasswordValid = await user.compareMasterPassword(masterPassword);
    
    if (!isPasswordValid || !isMasterPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Delete all user's passwords
    await Password.deleteMany({ userId: req.user.id });
    
    // Delete user account
    await User.findByIdAndDelete(req.user.id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  updateProfile,
  updatePassword,
  updateMasterPassword,
  getSettings,
  updateSettings,
  deleteAccount
};