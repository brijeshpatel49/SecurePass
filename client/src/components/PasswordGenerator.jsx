import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const PasswordGenerator = ({ isOpen, onClose, onPasswordGenerated }) => {
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordType, setPasswordType] = useState('password'); // 'password' or 'passphrase'
  const [loading, setLoading] = useState(false);
  
  // Password options
  const [passwordOptions, setPasswordOptions] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
    minUppercase: 0,
    minLowercase: 0,
    minNumbers: 0,
    minSymbols: 0
  });

  // Passphrase options
  const [passphraseOptions, setPassphraseOptions] = useState({
    wordCount: 4,
    separator: '-',
    includeNumbers: false,
    capitalize: false
  });

  const [strength, setStrength] = useState(null);

  const generatePassword = async () => {
    setLoading(true);
    try {
      const endpoint = passwordType === 'password' ? '/api/utility/generate-password' : '/api/utility/generate-passphrase';
      const options = passwordType === 'password' ? passwordOptions : passphraseOptions;
      
      const response = await api.post(endpoint, options);
      const result = passwordType === 'password' ? response.data.password : response.data.passphrase;
      
      setGeneratedPassword(result);
      setStrength(response.data.strength);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate password');
    } finally {
      setLoading(false);
    }
  };

  const checkStrength = async (password) => {
    try {
      const response = await api.post('/api/utility/check-strength', { password });
      setStrength(response.data);
    } catch (error) {
    }
  };

  useEffect(() => {
    if (generatedPassword) {
      checkStrength(generatedPassword);
    }
  }, [generatedPassword]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    toast.success('Password copied to clipboard');
  };

  const usePassword = () => {
    if (onPasswordGenerated) {
      onPasswordGenerated(generatedPassword);
    }
    onClose();
  };

  const getStrengthColor = (strength) => {
    switch (strength?.toLowerCase()) {
      case 'very strong': return 'text-green-600 dark:text-green-400';
      case 'strong': return 'text-blue-600 dark:text-blue-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'weak': return 'text-orange-600 dark:text-orange-400';
      case 'very weak': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStrengthWidth = (strength) => {
    switch (strength?.toLowerCase()) {
      case 'very strong': return 'w-full';
      case 'strong': return 'w-4/5';
      case 'medium': return 'w-3/5';
      case 'weak': return 'w-2/5';
      case 'very weak': return 'w-1/5';
      default: return 'w-0';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Password Generator
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Type Selection */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setPasswordType('password')}
              className={`px-4 py-2 rounded-lg ${
                passwordType === 'password'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Password
            </button>
            <button
              onClick={() => setPasswordType('passphrase')}
              className={`px-4 py-2 rounded-lg ${
                passwordType === 'passphrase'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Passphrase
            </button>
          </div>
        </div>

        {/* Generated Password Display */}
        {generatedPassword && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Generated {passwordType}:
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Copy
                </button>
                <button
                  onClick={usePassword}
                  className="text-green-600 hover:text-green-700 text-sm"
                >
                  Use This
                </button>
              </div>
            </div>
            <div className="font-mono text-lg bg-white dark:bg-gray-800 p-3 rounded border break-all">
              {generatedPassword}
            </div>
            
            {strength && (
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Strength:</span>
                  <span className={`text-sm font-medium ${getStrengthColor(strength.strength)}`}>
                    {strength.strength}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      strength.strength === 'Very Strong' ? 'bg-green-500' :
                      strength.strength === 'Strong' ? 'bg-blue-500' :
                      strength.strength === 'Medium' ? 'bg-yellow-500' :
                      strength.strength === 'Weak' ? 'bg-orange-500' : 'bg-red-500'
                    } ${getStrengthWidth(strength.strength)}`}
                  ></div>
                </div>
                {strength.feedback && strength.feedback.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Suggestions:</p>
                    <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                      {strength.feedback.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Password Options */}
        {passwordType === 'password' && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Length: {passwordOptions.length}
              </label>
              <input
                type="range"
                min="4"
                max="128"
                value={passwordOptions.length}
                onChange={(e) => setPasswordOptions(prev => ({ ...prev, length: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={passwordOptions.includeUppercase}
                  onChange={(e) => setPasswordOptions(prev => ({ ...prev, includeUppercase: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Uppercase (A-Z)</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={passwordOptions.includeLowercase}
                  onChange={(e) => setPasswordOptions(prev => ({ ...prev, includeLowercase: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Lowercase (a-z)</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={passwordOptions.includeNumbers}
                  onChange={(e) => setPasswordOptions(prev => ({ ...prev, includeNumbers: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Numbers (0-9)</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={passwordOptions.includeSymbols}
                  onChange={(e) => setPasswordOptions(prev => ({ ...prev, includeSymbols: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Symbols (!@#$)</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={passwordOptions.excludeSimilar}
                  onChange={(e) => setPasswordOptions(prev => ({ ...prev, excludeSimilar: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Exclude similar</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={passwordOptions.excludeAmbiguous}
                  onChange={(e) => setPasswordOptions(prev => ({ ...prev, excludeAmbiguous: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Exclude ambiguous</span>
              </label>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Min Uppercase</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={passwordOptions.minUppercase}
                  onChange={(e) => setPasswordOptions(prev => ({ ...prev, minUppercase: parseInt(e.target.value) || 0 }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Min Lowercase</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={passwordOptions.minLowercase}
                  onChange={(e) => setPasswordOptions(prev => ({ ...prev, minLowercase: parseInt(e.target.value) || 0 }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Min Numbers</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={passwordOptions.minNumbers}
                  onChange={(e) => setPasswordOptions(prev => ({ ...prev, minNumbers: parseInt(e.target.value) || 0 }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Min Symbols</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={passwordOptions.minSymbols}
                  onChange={(e) => setPasswordOptions(prev => ({ ...prev, minSymbols: parseInt(e.target.value) || 0 }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Passphrase Options */}
        {passwordType === 'passphrase' && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Word Count: {passphraseOptions.wordCount}
              </label>
              <input
                type="range"
                min="3"
                max="8"
                value={passphraseOptions.wordCount}
                onChange={(e) => setPassphraseOptions(prev => ({ ...prev, wordCount: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Separator
              </label>
              <select
                value={passphraseOptions.separator}
                onChange={(e) => setPassphraseOptions(prev => ({ ...prev, separator: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="-">Hyphen (-)</option>
                <option value="_">Underscore (_)</option>
                <option value=" ">Space ( )</option>
                <option value=".">Period (.)</option>
                <option value="">No separator</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={passphraseOptions.includeNumbers}
                  onChange={(e) => setPassphraseOptions(prev => ({ ...prev, includeNumbers: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include numbers</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={passphraseOptions.capitalize}
                  onChange={(e) => setPassphraseOptions(prev => ({ ...prev, capitalize: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Capitalize words</span>
              </label>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={generatePassword}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-4"
        >
          {loading ? 'Generating...' : `Generate ${passwordType === 'password' ? 'Password' : 'Passphrase'}`}
        </button>
      </div>
    </div>
  );
};

export default PasswordGenerator;