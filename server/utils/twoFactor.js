const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

class TwoFactorService {
  // Generate a secret for 2FA
  static generateSecret(userEmail) {
    return speakeasy.generateSecret({
      name: `PassManager (${userEmail})`,
      issuer: 'PassManager',
      length: 32
    });
  }

  // Generate QR code for the secret
  static async generateQRCode(secret) {
    try {
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
      return qrCodeUrl;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  // Verify TOTP token
  static verifyToken(token, secret) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps (60 seconds) of tolerance
    });
  }

  // Generate backup codes
  static generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // Verify backup code
  static verifyBackupCode(inputCode, backupCodes) {
    const normalizedInput = inputCode.toUpperCase().replace(/\s/g, '');
    const index = backupCodes.findIndex(code => code === normalizedInput);
    return index !== -1 ? index : false;
  }
}

module.exports = TwoFactorService;