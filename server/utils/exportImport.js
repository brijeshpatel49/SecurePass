const { decryptPassword } = require('./encryption');
const Password = require('../models/Password');

class ExportImportService {
  // Export passwords to JSON format
  static async exportPasswords(userId, masterPassword, format = 'json') {
    try {
      const passwords = await Password.find({ userId }).sort({ title: 1 });
      
      if (passwords.length === 0) {
        return {
          exportDate: new Date().toISOString(),
          version: '1.0',
          passwords: []
        };
      }
      
      const decryptedPasswords = passwords.map((password, index) => {
        try {
          const decryptedPassword = decryptPassword(password.encryptedPassword);
          
          return {
          title: password.title,
          website: password.website,
          username: password.username,
          email: password.email,
          password: decryptedPassword,
          category: password.category,
          notes: password.notes,
          tags: password.tags,
          isFavorite: password.isFavorite,
          createdAt: password.createdAt,
          updatedAt: password.updatedAt
          };
        } catch (decryptError) {
          console.error(`Failed to decrypt password ${index + 1}:`, decryptError.message);
          throw new Error(`Failed to decrypt password "${password.title}": ${decryptError.message}`);
        }
      });

      if (format === 'csv') {
        return this.convertToCSV(decryptedPasswords);
      }

      const result = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        passwords: decryptedPasswords
      };
      
      return result;
    } catch (error) {
      console.error('ExportImportService: Export failed:', error.message);
      throw new Error('Failed to export passwords: ' + error.message);
    }
  }

  // Convert passwords to CSV format
  static convertToCSV(passwords) {
    const headers = ['Title', 'Website', 'Username', 'Email', 'Password', 'Category', 'Notes', 'Tags', 'Favorite', 'Created', 'Updated'];
    
    const csvRows = [headers.join(',')];
    
    passwords.forEach(password => {
      const row = [
        this.escapeCSV(password.title),
        this.escapeCSV(password.website),
        this.escapeCSV(password.username),
        this.escapeCSV(password.email),
        this.escapeCSV(password.password),
        this.escapeCSV(password.category),
        this.escapeCSV(password.notes),
        this.escapeCSV(password.tags.join(';')),
        password.isFavorite ? 'Yes' : 'No',
        password.createdAt,
        password.updatedAt
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  // Escape CSV values
  static escapeCSV(value) {
    if (!value) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  // Import passwords from JSON
  static async importPasswords(userId, importData, masterPassword, options = {}) {
    const { skipDuplicates = true, updateExisting = false } = options;
    
    try {
      let passwords = [];
      
      // Handle different import formats
      if (Array.isArray(importData)) {
        passwords = importData;
      } else if (importData.passwords && Array.isArray(importData.passwords)) {
        passwords = importData.passwords;
      } else {
        throw new Error('Invalid import format');
      }

      const results = {
        imported: 0,
        skipped: 0,
        updated: 0,
        errors: []
      };

      for (const passwordData of passwords) {
        try {
          await this.importSinglePassword(userId, passwordData, masterPassword, {
            skipDuplicates,
            updateExisting,
            results
          });
        } catch (error) {
          results.errors.push({
            title: passwordData.title || 'Unknown',
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      throw new Error('Failed to import passwords: ' + error.message);
    }
  }

  // Import a single password
  static async importSinglePassword(userId, passwordData, masterPassword, options) {
    const { skipDuplicates, updateExisting, results } = options;
    
    // Validate required fields
    if (!passwordData.title || !passwordData.password) {
      throw new Error('Title and password are required');
    }

    // Check for existing password
    const existingPassword = await Password.findOne({
      userId,
      title: passwordData.title,
      website: passwordData.website || null
    });

    if (existingPassword) {
      if (skipDuplicates && !updateExisting) {
        results.skipped++;
        return;
      }
      
      if (updateExisting) {
        // Update existing password
        const { encryptPassword } = require('./encryption');
        const encryptedPassword = encryptPassword(passwordData.password);
        
        await Password.findByIdAndUpdate(existingPassword._id, {
          username: passwordData.username || existingPassword.username,
          email: passwordData.email || existingPassword.email,
          encryptedPassword,
          category: passwordData.category || existingPassword.category,
          notes: passwordData.notes || existingPassword.notes,
          tags: passwordData.tags || existingPassword.tags,
          isFavorite: passwordData.isFavorite !== undefined ? passwordData.isFavorite : existingPassword.isFavorite
        });
        
        results.updated++;
        return;
      }
    }

    // Create new password
    const { encryptPassword } = require('./encryption');
    const encryptedPassword = encryptPassword(passwordData.password);
    
    const newPassword = new Password({
      userId,
      title: passwordData.title,
      website: passwordData.website || '',
      username: passwordData.username || '',
      email: passwordData.email || '',
      encryptedPassword,
      category: passwordData.category || 'other',
      notes: passwordData.notes || '',
      tags: passwordData.tags || [],
      isFavorite: passwordData.isFavorite || false
    });

    await newPassword.save();
    results.imported++;
  }

  // Parse CSV import
  static parseCSV(csvData) {
    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header and one data row');
    }

    const headers = this.parseCSVLine(lines[0]);
    const passwords = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length !== headers.length) continue;

      const password = {};
      headers.forEach((header, index) => {
        const normalizedHeader = header.toLowerCase().trim();
        const value = values[index];

        switch (normalizedHeader) {
          case 'title':
          case 'name':
            password.title = value;
            break;
          case 'website':
          case 'url':
          case 'site':
            password.website = value;
            break;
          case 'username':
          case 'user':
            password.username = value;
            break;
          case 'email':
            password.email = value;
            break;
          case 'password':
            password.password = value;
            break;
          case 'category':
            password.category = value;
            break;
          case 'notes':
          case 'note':
            password.notes = value;
            break;
          case 'tags':
            password.tags = value ? value.split(';').map(tag => tag.trim()) : [];
            break;
          case 'favorite':
          case 'favourite':
            password.isFavorite = value.toLowerCase() === 'yes' || value.toLowerCase() === 'true';
            break;
        }
      });

      if (password.title && password.password) {
        passwords.push(password);
      }
    }

    return passwords;
  }

  // Parse a single CSV line
  static parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 2;
        } else {
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    values.push(current);
    return values;
  }
}

module.exports = ExportImportService;