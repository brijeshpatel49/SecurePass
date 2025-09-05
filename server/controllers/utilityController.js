const PasswordGenerator = require('../utils/passwordGenerator');
const ExportImportService = require('../utils/exportImport');
const User = require('../models/User');

// @desc    Generate password
// @route   POST /api/utility/generate-password
// @access  Private
const generatePassword = async (req, res) => {
  try {
    const options = req.body;
    
    // Validate options
    if (options.length && (options.length < 4 || options.length > 128)) {
      return res.status(400).json({
        success: false,
        message: 'Password length must be between 4 and 128 characters'
      });
    }

    const password = PasswordGenerator.generate(options);
    const strength = PasswordGenerator.checkStrength(password);

    res.json({
      success: true,
      data: {
        password,
        strength
      }
    });
  } catch (error) {
    console.error('Generate password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Generate passphrase
// @route   POST /api/utility/generate-passphrase
// @access  Private
const generatePassphrase = async (req, res) => {
  try {
    const options = req.body;
    
    const passphrase = PasswordGenerator.generatePassphrase(options);
    const strength = PasswordGenerator.checkStrength(passphrase);

    res.json({
      success: true,
      data: {
        passphrase,
        strength
      }
    });
  } catch (error) {
    console.error('Generate passphrase error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Check password strength
// @route   POST /api/utility/check-strength
// @access  Private
const checkPasswordStrength = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const strength = PasswordGenerator.checkStrength(password);

    res.json({
      success: true,
      data: strength
    });
  } catch (error) {
    console.error('Check password strength error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Export passwords
// @route   POST /api/utility/export
// @access  Private
const exportPasswords = async (req, res) => {
  try {

    
    const { masterPassword, format = 'json' } = req.body;
    
    if (!masterPassword) {
      return res.status(400).json({
        success: false,
        message: 'Master password is required'
      });
    }

    // Verify master password
    const user = await User.findById(req.user.id);
    const isValidMasterPassword = await user.compareMasterPassword(masterPassword);
    
    if (!isValidMasterPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid master password'
      });
    }

    const exportData = await ExportImportService.exportPasswords(req.user.id, masterPassword, format);
    
    if (!exportData) {
      return res.status(500).json({
        success: false,
        message: 'Failed to export passwords - no data returned'
      });
    }
    
    // Return data as JSON response, let client handle file creation
    res.json({
      success: true,
      data: exportData,
      format: format,
      filename: `passwords_export_${new Date().toISOString().split('T')[0]}.${format}`
    });
  } catch (error) {
    console.error('Export passwords error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Import passwords
// @route   POST /api/utility/import
// @access  Private
const importPasswords = async (req, res) => {
  try {
    const { masterPassword, data, format = 'json', options = {} } = req.body;
      format,
      options
    if (!masterPassword || !data) {
      return res.status(400).json({
        success: false,
        message: 'Master password and data are required'
      });
    }

    // Verify master password
    const user = await User.findById(req.user.id);
    const isValidMasterPassword = await user.compareMasterPassword(masterPassword);
    
    if (!isValidMasterPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid master password'
      });
    }

    let importData;
    if (format === 'csv') {
      importData = ExportImportService.parseCSV(data);
    } else {
      if (typeof data === 'string') {
        if (!data.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Import data cannot be empty'
          });
        }
        
        if (data.trim() === 'undefined') {
          return res.status(400).json({
            success: false,
            message: 'Invalid import file. The file appears to be corrupted or was not exported properly.'
          });
        }
        
        try {
          importData = JSON.parse(data);
        } catch (parseError) {
          return res.status(400).json({
            success: false,
            message: `Invalid JSON format: ${parseError.message}`
          });
        }
      } else {
        importData = data;
      }
    }

    const results = await ExportImportService.importPasswords(
      req.user.id, 
      importData, 
      masterPassword, 
      options
    );

    res.json({
      success: true,
      message: 'Import completed',
      data: results
    });
  } catch (error) {
    console.error('Import passwords error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

module.exports = {
  generatePassword,
  generatePassphrase,
  checkPasswordStrength,
  exportPasswords,
  importPasswords
};