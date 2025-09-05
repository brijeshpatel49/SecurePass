import api from './api';

export const userService = {
  // Profile management
  updateProfile: async (profileData) => {
    const response = await api.put('/user/profile', profileData);
    return response;
  },

  // Password management
  updatePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/user/password', {
      currentPassword,
      newPassword
    });
    return response;
  },

  updateMasterPassword: async (currentMasterPassword, newMasterPassword) => {
    const response = await api.put('/user/master-password', {
      currentMasterPassword,
      newMasterPassword
    });
    return response;
  },

  // Settings management
  getSettings: async () => {
    const response = await api.get('/user/settings');
    return response;
  },

  updateSettings: async (settings) => {
    const response = await api.put('/user/settings', settings);
    return response;
  },

  // Account deletion
  deleteAccount: async (password, masterPassword) => {
    const response = await api.delete('/user/account', {
      data: { password, masterPassword }
    });
    return response;
  }
};