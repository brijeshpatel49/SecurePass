require('dotenv').config();
const { encryptPassword, decryptPassword } = require('./utils/encryption');

console.log('Testing encryption...');

try {
  const testPassword = 'myTestPassword123';
  console.log('Original password:', testPassword);
  
  const encrypted = encryptPassword(testPassword);
  console.log('Encrypted:', encrypted);
  
  const decrypted = decryptPassword(encrypted);
  console.log('Decrypted:', decrypted);
  
  console.log('Encryption test:', testPassword === decrypted ? 'PASSED' : 'FAILED');
} catch (error) {
  console.error('Encryption test failed:', error);
}