const express = require('express');
const {
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
} = require('../controllers/passwordController');
const { protect, requireMasterPassword } = require('../middleware/auth');
const { validatePassword } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes that don't require master password
router.get('/', getPasswords);
router.get('/stats', getPasswordStats);
router.get('/tags', getAllTags);
router.get('/categories', getCategories);

// Routes that require master password
router.get('/:id', requireMasterPassword, getPassword);
router.post('/:id/view', requireMasterPassword, getPassword); // New route for viewing with master password
router.post('/', requireMasterPassword, createPassword); // Temporarily removed validation
router.put('/:id', requireMasterPassword, updatePassword);
router.delete('/:id', requireMasterPassword, deletePassword);

// Bulk operations (require master password)
router.put('/bulk/update', requireMasterPassword, bulkUpdatePasswords);
router.delete('/bulk/delete', requireMasterPassword, bulkDeletePasswords);

// Other operations
router.patch('/:id/favorite', toggleFavorite);

module.exports = router;