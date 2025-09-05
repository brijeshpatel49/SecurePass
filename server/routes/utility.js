const express = require('express');
const {
  generatePassword,
  generatePassphrase,
  checkPasswordStrength,
  exportPasswords,
  importPasswords
} = require('../controllers/utilityController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Password generation routes
router.post('/generate-password', generatePassword);
router.post('/generate-passphrase', generatePassphrase);
router.post('/check-strength', checkPasswordStrength);

// Export/Import routes
router.post('/export', exportPasswords);
router.post('/import', importPasswords);

module.exports = router;