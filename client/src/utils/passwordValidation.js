export const validatePassword = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password), // Match backend special chars exactly
    noCommon: !isCommonPassword(password),
    noSequential: !hasSequentialChars(password),
    noRepeated: !hasRepeatedChars(password)
  };

  // Backend requires: uppercase, lowercase, number, special character (4 mandatory)
  const mandatoryChecks = ['length', 'uppercase', 'lowercase', 'number', 'special'];
  const mandatoryPassed = mandatoryChecks.every(check => checks[check]);
  
  const strength = Object.values(checks).filter(Boolean).length;
  
  return {
    checks,
    strength,
    isValid: mandatoryPassed, // Must pass all mandatory checks to match backend
    score: Math.min(100, (strength / 8) * 100),
    mandatoryChecks,
    mandatoryPassed
  };
};

const commonPasswords = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 
  'password123', 'admin', 'letmein', 'welcome', 'monkey',
  'dragon', 'master', 'shadow', 'superman', 'michael'
];

const isCommonPassword = (password) => {
  return commonPasswords.some(common => 
    password.toLowerCase().includes(common.toLowerCase())
  );
};

const hasSequentialChars = (password) => {
  const sequences = ['123', '234', '345', '456', '567', '678', '789', '890',
                    'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij'];
  return sequences.some(seq => 
    password.toLowerCase().includes(seq) || 
    password.toLowerCase().includes(seq.split('').reverse().join(''))
  );
};

const hasRepeatedChars = (password) => {
  return /(.)\1{2,}/.test(password);
};

export const getPasswordStrengthColor = (score) => {
  if (score < 25) return 'bg-red-500';
  if (score < 50) return 'bg-orange-500';
  if (score < 75) return 'bg-yellow-500';
  return 'bg-green-500';
};

export const getPasswordStrengthText = (score) => {
  if (score < 25) return 'Very Weak';
  if (score < 50) return 'Weak';
  if (score < 75) return 'Good';
  return 'Strong';
};