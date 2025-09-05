const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
// Ensure we have a proper 32-byte key
const secretKey = process.env.ENCRYPTION_KEY ? 
  Buffer.from(process.env.ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)) : 
  crypto.randomBytes(32);



const encrypt = (text) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex')
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

const decrypt = (encryptedData) => {
  try {
    const { encrypted, iv } = encryptedData;
    
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(iv, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

// Simple encryption for storage (combines all data into one string)
const encryptPassword = (password) => {
  const encrypted = encrypt(password);
  return `${encrypted.encrypted}:${encrypted.iv}`;
};

const decryptPassword = (encryptedPassword) => {
  const [encrypted, iv] = encryptedPassword.split(':');
  return decrypt({ encrypted, iv });
};

module.exports = {
  encrypt,
  decrypt,
  encryptPassword,
  decryptPassword
};