const crypto = require('crypto');

class PasswordGenerator {
  static generate(options = {}) {
    const {
      length = 16,
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = true,
      excludeSimilar = false,
      excludeAmbiguous = false,
      customCharacters = '',
      minUppercase = 0,
      minLowercase = 0,
      minNumbers = 0,
      minSymbols = 0
    } = options;

    let charset = '';
    let requiredChars = [];

    // Define character sets
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    // Characters that look similar
    const similarChars = 'il1Lo0O';
    // Characters that can be ambiguous
    const ambiguousChars = '{}[]()/\\\'"`~,;.<>';

    // Build charset
    if (includeUppercase) {
      let chars = uppercase;
      if (excludeSimilar) chars = chars.replace(/[IL1O0]/g, '');
      charset += chars;
      if (minUppercase > 0) {
        requiredChars.push({ chars, min: minUppercase });
      }
    }

    if (includeLowercase) {
      let chars = lowercase;
      if (excludeSimilar) chars = chars.replace(/[il1o0]/g, '');
      charset += chars;
      if (minLowercase > 0) {
        requiredChars.push({ chars, min: minLowercase });
      }
    }

    if (includeNumbers) {
      let chars = numbers;
      if (excludeSimilar) chars = chars.replace(/[10]/g, '');
      charset += chars;
      if (minNumbers > 0) {
        requiredChars.push({ chars, min: minNumbers });
      }
    }

    if (includeSymbols) {
      let chars = symbols;
      if (excludeAmbiguous) {
        chars = chars.replace(/[{}[\]()/\\'"`,;.<>]/g, '');
      }
      charset += chars;
      if (minSymbols > 0) {
        requiredChars.push({ chars, min: minSymbols });
      }
    }

    if (customCharacters) {
      charset += customCharacters;
    }

    if (!charset) {
      throw new Error('No character set selected');
    }

    // Generate password
    let password = '';
    const passwordArray = new Array(length);

    // First, add required minimum characters
    let usedPositions = new Set();
    for (const requirement of requiredChars) {
      for (let i = 0; i < requirement.min; i++) {
        let position;
        do {
          position = crypto.randomInt(0, length);
        } while (usedPositions.has(position));
        
        usedPositions.add(position);
        const randomChar = requirement.chars[crypto.randomInt(0, requirement.chars.length)];
        passwordArray[position] = randomChar;
      }
    }

    // Fill remaining positions
    for (let i = 0; i < length; i++) {
      if (!passwordArray[i]) {
        passwordArray[i] = charset[crypto.randomInt(0, charset.length)];
      }
    }

    return passwordArray.join('');
  }

  static generatePassphrase(options = {}) {
    const {
      wordCount = 4,
      separator = '-',
      includeNumbers = false,
      capitalize = false
    } = options;

    // Common words for passphrase generation
    const words = [
      'apple', 'banana', 'cherry', 'dragon', 'elephant', 'forest', 'guitar', 'house',
      'island', 'jungle', 'kitten', 'lemon', 'mountain', 'ocean', 'piano', 'queen',
      'river', 'sunset', 'tiger', 'umbrella', 'violet', 'window', 'yellow', 'zebra',
      'bridge', 'castle', 'dream', 'eagle', 'flower', 'garden', 'happy', 'ice',
      'jazz', 'knight', 'light', 'magic', 'night', 'orange', 'peace', 'quick',
      'rainbow', 'star', 'tree', 'unique', 'voice', 'water', 'extra', 'young'
    ];

    const selectedWords = [];
    for (let i = 0; i < wordCount; i++) {
      let word = words[crypto.randomInt(0, words.length)];
      if (capitalize) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      if (includeNumbers && i === wordCount - 1) {
        word += crypto.randomInt(10, 99);
      }
      selectedWords.push(word);
    }

    return selectedWords.join(separator);
  }

  static checkStrength(password) {
    let score = 0;
    const feedback = [];

    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push('Use at least 8 characters');

    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Include uppercase letters');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Include numbers');

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('Include special characters');

    // Common patterns (negative points)
    if (/(.)\1{2,}/.test(password)) {
      score -= 1;
      feedback.push('Avoid repeated characters');
    }

    if (/123|abc|qwe/i.test(password)) {
      score -= 1;
      feedback.push('Avoid common sequences');
    }

    // Determine strength level
    let strength = 'Very Weak';
    if (score >= 7) strength = 'Very Strong';
    else if (score >= 5) strength = 'Strong';
    else if (score >= 3) strength = 'Medium';
    else if (score >= 1) strength = 'Weak';

    return {
      score: Math.max(0, score),
      strength,
      feedback
    };
  }
}

module.exports = PasswordGenerator;