const express = require('express');
const {
  updateProfile,
  updatePassword,
  updateMasterPassword,
  updateSettings,
  getSettings,
  deleteAccount
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.put('/profile', updateProfile);
router.put('/password', updatePassword);
router.put('/master-password', updateMasterPassword);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.delete('/account', deleteAccount);

module.exports = router;