import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const ExportImport = ({ isOpen, onClose, onSuccess, initialTab = 'export' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [masterPassword, setMasterPassword] = useState('');
  const [exportFormat, setExportFormat] = useState('json');
  const [importData, setImportData] = useState('');
  const [importFormat, setImportFormat] = useState('json');
  const [importOptions, setImportOptions] = useState({
    skipDuplicates: true,
    updateExisting: false
  });
  const [loading, setLoading] = useState(false);
  const [importResults, setImportResults] = useState(null);

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const handleExport = async () => {
    if (!masterPassword) {
      toast.error('Master password is required');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/utility/export', {
        masterPassword,
        format: exportFormat
      });

      // Handle the response format
      if (!response.data) {
        toast.error('Export failed: No data received from server');
        return;
      }

      const exportData = response.data.data || response.data;
      const filename = response.data.filename || `passwords_export_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      
      let content;
      if (exportFormat === 'csv') {
        content = exportData;
      } else {
        content = JSON.stringify(exportData, null, 2);
      }
      
      const blob = new Blob([content], {
        type: exportFormat === 'csv' ? 'text/csv' : 'application/json'
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Passwords exported successfully');
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!masterPassword) {
      toast.error('Master password is required');
      return;
    }

    // Check if we have data from either file upload or textarea
    const hasData = importData && importData.trim() && importData.trim() !== 'undefined';
    
    if (!hasData) {
      toast.error('Please upload a file or paste import data in the textarea');
      return;
    }

    setLoading(true);
    try {

      
      const response = await api.post('/utility/import', {
        masterPassword,
        data: importData,
        format: importFormat,
        options: importOptions
      });

      setImportResults(response.data.data || response.data);
      toast.success('Import completed successfully');
      onSuccess?.();
      
      // Close modal and redirect after successful import
      setTimeout(() => {
        onClose();
        window.location.reload(); // Refresh to show imported passwords
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      // If no file selected, don't clear the textarea
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result || '';
      
      // Only set the data if we actually got content
      if (content && content.trim() && content.trim() !== 'undefined') {
        setImportData(content);
        toast.success(`File loaded: ${file.name}`);
      } else {
        toast.error('File appears to be empty or corrupted');
        return;
      }
      
      // Auto-detect format based on file extension
      if (file.name.endsWith('.csv')) {
        setImportFormat('csv');
      } else if (file.name.endsWith('.json')) {
        setImportFormat('json');
      }
    };
    
    reader.onerror = (e) => {
      toast.error('Failed to read file');
    };
    
    reader.readAsText(file);
  };

  const resetForm = () => {
    setMasterPassword('');
    setImportData('');
    setImportResults(null);
    setActiveTab(initialTab);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Export / Import Passwords
          </h2>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'export'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Export
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'import'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Import
          </button>
        </div>

        {/* Master Password */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Master Password *
          </label>
          <input
            type="password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            placeholder="Enter your master password"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Export Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Export Information
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• All your passwords will be decrypted and exported</li>
                <li>• Keep the exported file secure and delete it after use</li>
                <li>• JSON format preserves all metadata (tags, notes, etc.)</li>
                <li>• CSV format is compatible with most password managers</li>
              </ul>
            </div>

            <button
              onClick={handleExport}
              disabled={loading || !masterPassword}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Exporting...' : 'Export Passwords'}
            </button>
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Import Format
              </label>
              <select
                value={importFormat}
                onChange={(e) => setImportFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Choose one method: Upload a file OR paste data in the textarea below
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Method 1: Upload File
              </label>
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="text-center py-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">OR</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Method 2: Paste Data
              </label>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder={importFormat === 'json' ? 'Paste JSON data here...' : 'Paste CSV data here...'}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Duplicate Handling
              </h3>
              <div className="space-y-2">
                <label className="flex items-start">
                  <input
                    type="radio"
                    name="duplicateHandling"
                    checked={importOptions.skipDuplicates && !importOptions.updateExisting}
                    onChange={() => setImportOptions({ skipDuplicates: true, updateExisting: false })}
                    className="mr-2 mt-0.5"
                  />
                  <div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Skip duplicates</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Keep existing passwords, ignore duplicates from import</p>
                  </div>
                </label>
                <label className="flex items-start">
                  <input
                    type="radio"
                    name="duplicateHandling"
                    checked={!importOptions.skipDuplicates && importOptions.updateExisting}
                    onChange={() => setImportOptions({ skipDuplicates: false, updateExisting: true })}
                    className="mr-2 mt-0.5"
                  />
                  <div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Update existing</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Replace existing passwords with imported ones</p>
                  </div>
                </label>
                <label className="flex items-start">
                  <input
                    type="radio"
                    name="duplicateHandling"
                    checked={!importOptions.skipDuplicates && !importOptions.updateExisting}
                    onChange={() => setImportOptions({ skipDuplicates: false, updateExisting: false })}
                    className="mr-2 mt-0.5"
                  />
                  <div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Import all</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Import everything, creating duplicates if needed</p>
                  </div>
                </label>
              </div>
            </div>

            {importResults && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  Import Results
                </h3>
                <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <p>• Imported: {importResults.imported} passwords</p>
                  <p>• Updated: {importResults.updated} passwords</p>
                  <p>• Skipped: {importResults.skipped} passwords</p>
                  {importResults.errors && importResults.errors.length > 0 && (
                    <div>
                      <p>• Errors: {importResults.errors.length}</p>
                      <ul className="ml-4 mt-1">
                        {importResults.errors.slice(0, 3).map((error, index) => (
                          <li key={index}>- {error.title}: {error.error}</li>
                        ))}
                        {importResults.errors.length > 3 && (
                          <li>- ... and {importResults.errors.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={loading || !masterPassword || !importData.trim()}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Importing...' : 'Import Passwords'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportImport;