import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import {
  CogIcon,
  UserIcon,
  ShieldCheckIcon,
  BellIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { userService } from "../services/userService";
import { authService } from "../services/authService";
import { validatePassword } from "../utils/passwordValidation";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";

import ExportImport from "../components/ExportImport";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPasswords, setShowPasswords] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({});

  const [showExportImport, setShowExportImport] = useState(false);
  const [exportImportTab, setExportImportTab] = useState('export');
  const { user, updateUser } = useAuth();

  const profileForm = useForm({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    },
  });

  const passwordForm = useForm();
  const masterPasswordForm = useForm();

  const tabs = [
    { id: "profile", name: "Profile", icon: UserIcon },
    { id: "security", name: "Security", icon: ShieldCheckIcon },
    { id: "data", name: "Data", icon: ArrowDownTrayIcon },
    { id: "notifications", name: "Notifications", icon: BellIcon },
    { id: "danger", name: "Danger Zone", icon: ExclamationTriangleIcon },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user, profileForm]);

  const loadSettings = async () => {
    try {
      const response = await userService.getSettings();
      setSettings(response.data.settings);
    } catch (error) {
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleProfileUpdate = async (data) => {
    setIsLoading(true);
    try {
      const response = await userService.updateProfile(data);

      if (response.data && response.data.user) {
        updateUser(response.data.user);
        toast.success("Profile updated successfully!");
        profileForm.reset({
          firstName: response.data.user.firstName || "",
          lastName: response.data.user.lastName || "",
          email: response.data.user.email || "",
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const validation = validatePassword(data.newPassword);
    if (!validation.isValid) {
      toast.error("Please create a stronger password");
      return;
    }

    setIsLoading(true);
    try {
      await userService.updatePassword(data.currentPassword, data.newPassword);
      toast.success("Password updated successfully!");
      passwordForm.reset();
      setShowPasswords({});
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMasterPasswordUpdate = async (data) => {
    if (data.newMasterPassword !== data.confirmMasterPassword) {
      toast.error("Master passwords do not match");
      return;
    }

    const validation = validatePassword(data.newMasterPassword);
    if (!validation.isValid) {
      toast.error("Please create a stronger master password");
      return;
    }

    setIsLoading(true);
    try {
      await userService.updateMasterPassword(
        data.currentMasterPassword,
        data.newMasterPassword
      );
      toast.success("Master password updated successfully!");
      masterPasswordForm.reset();
      setShowPasswords({});
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update master password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsUpdate = async (newSettings) => {
    setIsLoading(true);
    try {
      const response = await userService.updateSettings(newSettings);
      setSettings(response.data.settings);
      toast.success("Settings updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const password = prompt("Enter your password to confirm account deletion:");
    const masterPassword = prompt("Enter your master password to confirm:");

    if (!password || !masterPassword) {
      toast.error("Both passwords are required to delete account");
      return;
    }

    if (!confirm("Are you absolutely sure? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    try {
      await userService.deleteAccount(password, masterPassword);
      toast.success("Account deleted successfully");
      // Logout will be handled by the auth context
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in-up min-h-full">
      <div className="flex items-center space-x-3 md:space-x-4">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl md:rounded-2xl flex items-center justify-center">
          <CogIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-4xl font-bold gradient-text">
            Settings
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            Customize your account and security preferences
          </p>
        </div>
      </div>

      <div className="card backdrop-blur-xl transition-none">
        <div className="border-b border-white/20 dark:border-gray-700/50">
          <nav className="-mb-px flex space-x-1 md:space-x-2 px-3 md:px-6 overflow-x-auto scrollbar-hide">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 md:py-4 px-3 md:px-6 border-b-2 font-semibold text-xs md:text-sm flex items-center space-x-2 md:space-x-3 whitespace-nowrap transition-all duration-300 rounded-t-xl md:rounded-t-2xl animate-fade-in min-w-0 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`p-1.5 md:p-2 rounded-lg transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <Icon className="w-3 h-3 md:w-4 md:h-4" />
                  </div>
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 md:p-8">
          {activeTab === "profile" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Profile Information
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Update your personal details
                  </p>
                </div>
              </div>

              <form
                onSubmit={profileForm.handleSubmit(handleProfileUpdate)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      {...profileForm.register("firstName", {
                        required: "First name is required",
                      })}
                      type="text"
                      className="input w-full"
                      placeholder="First name"
                    />
                    {profileForm.formState.errors.firstName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {profileForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      {...profileForm.register("lastName", {
                        required: "Last name is required",
                      })}
                      type="text"
                      className="input w-full"
                      placeholder="Last name"
                    />
                    {profileForm.formState.errors.lastName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {profileForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      {...profileForm.register("email")}
                      type="email"
                      className="input w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60"
                      placeholder="Email address"
                      disabled
                      readOnly
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Email address cannot be changed for security reasons
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" inline />
                    ) : (
                      <CheckCircleIcon className="w-4 h-4" />
                    )}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Security Settings
                </h3>
              </div>

              {/* Change Password */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 md:p-6">
                <h4 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Change Password
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Update your account password
                </p>

                <form
                  onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        {...passwordForm.register("currentPassword", {
                          required: "Current password is required",
                        })}
                        type={
                          showPasswords.currentPassword ? "text" : "password"
                        }
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() =>
                          togglePasswordVisibility("currentPassword")
                        }
                      >
                        {showPasswords.currentPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        {...passwordForm.register("newPassword", {
                          required: "New password is required",
                          validate: (value) => {
                            const validation = validatePassword(value);
                            return (
                              validation.isValid ||
                              "Password does not meet security requirements"
                            );
                          },
                        })}
                        type={showPasswords.newPassword ? "text" : "password"}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility("newPassword")}
                      >
                        {showPasswords.newPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordForm.watch("newPassword") && (
                      <PasswordStrengthIndicator
                        password={passwordForm.watch("newPassword")}
                        showDetails={false}
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        {...passwordForm.register("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (value) =>
                            value === passwordForm.watch("newPassword") ||
                            "Passwords do not match",
                        })}
                        type={
                          showPasswords.confirmPassword ? "text" : "password"
                        }
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() =>
                          togglePasswordVisibility("confirmPassword")
                        }
                      >
                        {showPasswords.confirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" inline />
                    ) : (
                      <CheckCircleIcon className="w-4 h-4" />
                    )}
                    <span>Update Password</span>
                  </button>
                </form>
              </div>

              {/* Two-Factor Authentication */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 md:p-6">
                <h4 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Two-Factor Authentication
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Add an extra layer of security to your account
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Status:{" "}
                      <span
                        className={`font-medium ${
                          user?.twoFactorEnabled
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {user?.twoFactorEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </span>
                    {user?.twoFactorEnabled && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Your account is protected with 2FA
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {!user?.twoFactorEnabled ? (
                      <button
                        onClick={() => toast("2FA setup coming soon!")}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm"
                      >
                        Enable 2FA
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={async () => {
                            const password = prompt(
                              "Enter your password to disable 2FA:"
                            );
                            if (password) {
                              try {
                                await authService.disable2FA(password);
                                toast.success("2FA disabled successfully");
                                // Refresh user data
                                const userData =
                                  await authService.getCurrentUser();
                                updateUser(userData);
                              } catch (error) {
                                toast.error(
                                  error.response?.data?.message ||
                                    "Failed to disable 2FA"
                                );
                              }
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm"
                        >
                          Disable 2FA
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center space-x-3">
                <ArrowDownTrayIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Data Management
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Export Data */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 md:p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <ArrowDownTrayIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-base md:text-lg font-medium text-gray-900 dark:text-white">
                      Export Data
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Download all your passwords and data in JSON or CSV format
                  </p>
                  <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1 mb-4">
                    <li>• Includes all passwords, categories, and notes</li>
                    <li>• Data is decrypted for portability</li>
                    <li>• Keep exported files secure</li>
                  </ul>
                  <button
                    onClick={() => {
                      setExportImportTab('export');
                      setShowExportImport(true);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm"
                  >
                    Export Passwords
                  </button>
                </div>

                {/* Import Data */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 md:p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <ArrowUpTrayIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h4 className="text-base md:text-lg font-medium text-gray-900 dark:text-white">
                      Import Data
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Import passwords from other password managers or backup
                    files
                  </p>
                  <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1 mb-4">
                    <li>• Supports JSON and CSV formats</li>
                    <li>• Duplicate detection and handling</li>
                    <li>• Bulk import with progress tracking</li>
                  </ul>
                  <button
                    onClick={() => {
                      setExportImportTab('import');
                      setShowExportImport(true);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm"
                  >
                    Import Passwords
                  </button>
                </div>
              </div>

              {/* Data Statistics */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 md:p-6">
                <h4 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Data Overview
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {settings.totalPasswords || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Passwords
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {settings.favoritePasswords || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Favorites
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {settings.totalCategories || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Categories
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {settings.totalTags || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Tags
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center space-x-3">
                <BellIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Notification Preferences
                </h3>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Email Notifications
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive email updates about your account
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) =>
                        handleSettingsUpdate({
                          ...settings,
                          emailNotifications: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Security Alerts
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get notified about security events
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.securityAlerts}
                      onChange={(e) =>
                        handleSettingsUpdate({
                          ...settings,
                          securityAlerts: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Auto Logout
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Automatically log out after inactivity
                      </p>
                    </div>
                  </div>
                  <select
                    value={settings.autoLogout}
                    onChange={(e) =>
                      handleSettingsUpdate({
                        ...settings,
                        autoLogout: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value={5}>5 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "danger" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">
                  Danger Zone
                </h3>
              </div>

              <div className="border border-red-200 dark:border-red-800 rounded-lg p-6 bg-red-50 dark:bg-red-900/20">
                <h4 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
                  Delete Account
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                  Once you delete your account, there is no going back. Please
                  be certain. All your passwords and data will be permanently
                  deleted.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" inline />
                  ) : (
                    <ExclamationTriangleIcon className="w-4 h-4" />
                  )}
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ExportImport
        isOpen={showExportImport}
        onClose={() => setShowExportImport(false)}
        initialTab={exportImportTab}
        onSuccess={() => {
          // Optionally refresh data statistics
          loadSettings();
        }}
      />
    </div>
  );
};

export default Settings;
