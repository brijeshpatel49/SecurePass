import React from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from '../utils/passwordValidation';

const PasswordStrengthIndicator = ({ password, showDetails = true }) => {
  const validation = validatePassword(password);
  
  if (!password) return null;

  const requirements = [
    { key: 'length', label: 'At least 8 characters', check: validation.checks.length, mandatory: true },
    { key: 'uppercase', label: 'One uppercase letter (A-Z)', check: validation.checks.uppercase, mandatory: true },
    { key: 'lowercase', label: 'One lowercase letter (a-z)', check: validation.checks.lowercase, mandatory: true },
    { key: 'number', label: 'One number (0-9)', check: validation.checks.number, mandatory: true },
    { key: 'special', label: 'One special character (@$!%*?&)', check: validation.checks.special, mandatory: true },
    { key: 'noCommon', label: 'Not a common password', check: validation.checks.noCommon, mandatory: false },
    { key: 'noSequential', label: 'No sequential characters', check: validation.checks.noSequential, mandatory: false },
    { key: 'noRepeated', label: 'No repeated characters', check: validation.checks.noRepeated, mandatory: false }
  ];

  return (
    <div className="mt-4 space-y-3">
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Password Strength
          </span>
          <div className="flex items-center space-x-2">
            {validation.isValid ? (
              <ShieldCheckIcon className="h-4 w-4 text-green-500" />
            ) : (
              <XCircleIcon className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              validation.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {validation.isValid ? 'Valid' : 'Invalid'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({getPasswordStrengthText(validation.score)})
            </span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ease-out ${getPasswordStrengthColor(validation.score)}`}
            style={{ width: `${validation.score}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      {showDetails && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Security Requirements
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {requirements.map((req) => (
              <div 
                key={req.key}
                className={`flex items-center space-x-2 text-xs transition-all duration-300 ${
                  req.check 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {req.check ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircleIcon className="h-4 w-4 text-gray-400" />
                )}
                <span className={req.check ? 'font-medium' : ''}>{req.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Score */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <span className="text-sm text-gray-600 dark:text-gray-400">Security Score</span>
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-full transition-all duration-500 ease-out rounded-full ${getPasswordStrengthColor(validation.score)}`}
              style={{ width: `${validation.score}%` }}
            />
          </div>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            {Math.round(validation.score)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;