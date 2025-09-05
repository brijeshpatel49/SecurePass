const Password = require('../models/Password');
const { encryptPassword, decryptPassword } = require('../utils/encryption');

// @desc    Get all passwords for user
// @route   GET /api/passwords
// @access  Private
const getPasswords = async (req, res) => {
  try {
    const { search, category, favorite, tags, sortBy = 'updatedAt', sortOrder = 'desc' } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = { userId: req.user.id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { website: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (favorite === 'true') {
      query.isFavorite = true;
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const passwords = await Password.find(query)
      .select('-encryptedPassword')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await Password.countDocuments(query);

    res.json({
      success: true,
      data: {
        passwords,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
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

// @desc    Get single password
// @route   GET /api/passwords/:id
// @access  Private
const getPassword = async (req, res) => {
  try {
    const password = await Password.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!password) {
      return res.status(404).json({
        success: false,
        message: 'Password not found'
      });
    }

    // Decrypt password
    const decryptedPassword = decryptPassword(password.encryptedPassword);

    // Update last accessed
    password.lastAccessed = new Date();
    await password.save();

    res.json({
      success: true,
      data: {
        password: {
          ...password.toObject(),
          password: decryptedPassword,
          encryptedPassword: undefined
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

// @desc    Create new password
// @route   POST /api/passwords
// @access  Private
const createPassword = async (req, res) => {
  try {
    const {
      title,
      website,
      username,
      email,
      password,
      category,
      notes,
      tags
    } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    let encryptedPassword;
    try {
      encryptedPassword = encryptPassword(password);
    } catch (encError) {
      return res.status(500).json({
        success: false,
        message: 'Password encryption failed'
      });
    }

    const passwordData = {
      userId: req.user.id,
      title,
      website: website || '',
      username: username || '',
      email: email || '',
      encryptedPassword,
      category: category || 'other',
      notes: notes || '',
      tags: tags || []
    };

    let newPassword;
    try {
      newPassword = await Password.create(passwordData);
    } catch (dbError) {
      return res.status(500).json({
        success: false,
        message: 'Database save failed: ' + dbError.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Password created successfully',
      data: {
        password: {
          ...newPassword.toObject(),
          encryptedPassword: undefined
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update password
// @route   PUT /api/passwords/:id
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const {
      title,
      website,
      username,
      email,
      password,
      category,
      notes,
      tags,
      isFavorite
    } = req.body;

    const passwordEntry = await Password.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!passwordEntry) {
      return res.status(404).json({
        success: false,
        message: 'Password not found'
      });
    }

    // Update fields
    passwordEntry.title = title || passwordEntry.title;
    passwordEntry.website = website || passwordEntry.website;
    passwordEntry.username = username || passwordEntry.username;
    passwordEntry.email = email || passwordEntry.email;
    passwordEntry.category = category || passwordEntry.category;
    passwordEntry.notes = notes || passwordEntry.notes;
    passwordEntry.tags = tags || passwordEntry.tags;
    passwordEntry.isFavorite = isFavorite !== undefined ? isFavorite : passwordEntry.isFavorite;

    // Encrypt new password if provided
    if (password) {
      passwordEntry.encryptedPassword = encryptPassword(password);
    }

    await passwordEntry.save();

    res.json({
      success: true,
      message: 'Password updated successfully',
      data: {
        password: {
          ...passwordEntry.toObject(),
          encryptedPassword: undefined
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

// @desc    Delete password
// @route   DELETE /api/passwords/:id
// @access  Private
const deletePassword = async (req, res) => {
  try {
    const password = await Password.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!password) {
      return res.status(404).json({
        success: false,
        message: 'Password not found'
      });
    }

    await password.deleteOne();

    res.json({
      success: true,
      message: 'Password deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get password statistics
// @route   GET /api/passwords/stats
// @access  Private
const getPasswordStats = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const totalCount = await Password.countDocuments({ userId: userId });

    const stats = await Password.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          favorites: { $sum: { $cond: ['$isFavorite', 1, 0] } },
          categories: {
            $push: '$category'
          }
        }
      }
    ]);

    const categoryStats = await Password.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      total: stats[0]?.total || 0,
      favorites: stats[0]?.favorites || 0,
      categories: categoryStats.reduce((acc, cat) => {
        acc[cat._id] = cat.count;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Bulk update passwords
// @route   PUT /api/passwords/bulk
// @access  Private
const bulkUpdatePasswords = async (req, res) => {
  try {
    const { passwordIds, updates } = req.body;
    
    if (!passwordIds || !Array.isArray(passwordIds) || passwordIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Password IDs array is required'
      });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates object is required'
      });
    }

    // Only allow certain fields to be bulk updated
    const allowedUpdates = ['category', 'tags', 'isFavorite'];
    const filteredUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid update fields provided'
      });
    }

    const result = await Password.updateMany(
      { 
        _id: { $in: passwordIds },
        userId: req.user.id 
      },
      { $set: filteredUpdates }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} passwords updated successfully`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Bulk delete passwords
// @route   DELETE /api/passwords/bulk
// @access  Private
const bulkDeletePasswords = async (req, res) => {
  try {
    const { passwordIds } = req.body;
    
    if (!passwordIds || !Array.isArray(passwordIds) || passwordIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Password IDs array is required'
      });
    }

    const result = await Password.deleteMany({
      _id: { $in: passwordIds },
      userId: req.user.id
    });

    res.json({
      success: true,
      message: `${result.deletedCount} passwords deleted successfully`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all unique tags
// @route   GET /api/passwords/tags
// @access  Private
const getAllTags = async (req, res) => {
  try {
    const tags = await Password.distinct('tags', { userId: req.user.id });
    
    res.json({
      success: true,
      data: {
        tags: tags.filter(tag => tag && tag.trim() !== '')
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get password categories with counts
// @route   GET /api/passwords/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const categories = await Password.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat._id] = cat.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        categories: categoryMap
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Toggle password favorite status
// @route   PATCH /api/passwords/:id/favorite
// @access  Private
const toggleFavorite = async (req, res) => {
  try {
    const password = await Password.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!password) {
      return res.status(404).json({
        success: false,
        message: 'Password not found'
      });
    }

    password.isFavorite = !password.isFavorite;
    await password.save();

    res.json({
      success: true,
      message: `Password ${password.isFavorite ? 'added to' : 'removed from'} favorites`,
      data: {
        password: {
          ...password.toObject(),
          encryptedPassword: undefined
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

module.exports = {
  getPasswords,
  getPassword,
  createPassword,
  updatePassword,
  deletePassword,
  getPasswordStats,
  bulkUpdatePasswords,
  bulkDeletePasswords,
  getAllTags,
  getCategories,
  toggleFavorite
};