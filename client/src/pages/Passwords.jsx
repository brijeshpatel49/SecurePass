import { useState, useEffect } from "react";
import { passwordService } from "../services/passwordService";
import { useAuth } from "../context/AuthContext";
import {
  Plus,
  Search,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Star,
  Copy,
  Filter,
  Key,
  Tag,
  MoreVertical,
  CheckSquare,
  Square,
  ArrowUpDown,
  Heart,
  Folder,
} from "lucide-react";
import {
  HeartIcon,
  TagIcon,
  FolderIcon,
  EllipsisVerticalIcon,
  CheckIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import PasswordModal from "../components/PasswordModal";
import MasterPasswordModal from "../components/MasterPasswordModal";
import PasswordGenerator from "../components/PasswordGenerator";

const Passwords = () => {
  const { verifyMasterPassword } = useAuth();
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFavorites, setShowFavorites] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMasterPasswordModal, setShowMasterPasswordModal] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState(new Set());

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "social", label: "Social" },
    { value: "work", label: "Work" },
    { value: "finance", label: "Finance" },
    { value: "entertainment", label: "Entertainment" },
    { value: "shopping", label: "Shopping" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    fetchPasswords();
  }, [searchTerm, selectedCategory, showFavorites]);

  const fetchPasswords = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        category: selectedCategory,
        favorite: showFavorites,
      };

      const response = await passwordService.getPasswords(params);
      setPasswords(response?.data?.passwords || []);
    } catch (error) {
      toast.error("Failed to fetch passwords");
      setPasswords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMasterPasswordVerified = async (masterPassword) => {
    if (pendingAction && typeof pendingAction === "function") {
      try {
        await pendingAction(masterPassword);
      } catch (error) {
        toast.error("Failed to execute action");
      }
      setPendingAction(null);
    }
    setShowMasterPasswordModal(false);
  };

  const handleViewPassword = async (password) => {
    if (visiblePasswords.has(password._id)) {
      // Hide password
      setVisiblePasswords((prev) => {
        const newSet = new Set(prev);
        newSet.delete(password._id);
        return newSet;
      });
      // Remove decrypted password from the password object
      setPasswords((prev) =>
        prev.map((p) =>
          p._id === password._id ? { ...p, decryptedPassword: null } : p
        )
      );
    } else {
      // Show password - need master password verification
      const action = async (masterPassword) => {
        try {
          const response = await passwordService.getPassword(
            password._id,
            masterPassword
          );
          const decryptedPassword = response.data.password.password;

          // Update the password in the list with decrypted password
          setPasswords((prev) =>
            prev.map((p) =>
              p._id === password._id ? { ...p, decryptedPassword } : p
            )
          );

          // Add to visible passwords
          setVisiblePasswords((prev) => new Set([...prev, password._id]));

          toast.success("Password revealed");
        } catch (error) {
          toast.error("Failed to decrypt password");
        }
      };
      setPendingAction(() => action);
      setShowMasterPasswordModal(true);
    }
  };

  const handleEditPassword = async (password) => {
    const action = async (masterPassword) => {
      try {
        const response = await passwordService.getPassword(
          password._id,
          masterPassword
        );
        setSelectedPassword(response.data.password);
        setShowPasswordModal(true);
      } catch (error) {
        toast.error("Failed to decrypt password");
      }
    };
    setPendingAction(() => action);
    setShowMasterPasswordModal(true);
  };

  const handleDeletePassword = async (password) => {
    if (!confirm("Are you sure you want to delete this password?")) return;

    const action = async (masterPassword) => {
      try {
        await passwordService.deletePassword(password._id, masterPassword);
        toast.success("Password deleted successfully");
        fetchPasswords();
      } catch (error) {
        toast.error("Failed to delete password");
      }
    };
    setPendingAction(() => action);
    setShowMasterPasswordModal(true);
  };

  const handleToggleFavorite = async (password) => {
    try {
      await passwordService.toggleFavorite(password._id);
      setPasswords((prev) =>
        prev.map((p) =>
          p._id === password._id ? { ...p, isFavorite: !p.isFavorite } : p
        )
      );
      toast.success(
        password.isFavorite ? "Removed from favorites" : "Added to favorites"
      );
    } catch (error) {
      toast.error("Failed to update favorite status");
    }
  };

  const handlePasswordSaved = () => {
    setShowPasswordModal(false);
    setSelectedPassword(null);
    fetchPasswords();
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const togglePasswordVisibility = (passwordId) => {
    setVisiblePasswords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(passwordId)) {
        newSet.delete(passwordId);
      } else {
        newSet.add(passwordId);
      }
      return newSet;
    });
  };

  const filteredPasswords = passwords.filter((password) => {
    const matchesSearch =
      password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (password.website &&
        password.website.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (password.username &&
        password.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (password.email &&
        password.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || password.category === selectedCategory;
    const matchesFavorites = !showFavorites || password.isFavorite;

    return matchesSearch && matchesCategory && matchesFavorites;
  });

  return (
    <div className="space-y-6 min-h-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl md:rounded-2xl flex items-center justify-center">
            <Key className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold gradient-text">
              Passwords
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Manage your secure credentials
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedPassword(null);
            setShowPasswordModal(true);
          }}
          className="btn-primary flex items-center text-sm w-1/2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Password</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 md:p-8 animate-fade-in">
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <input
                type="text"
                placeholder="Search passwords, websites, usernames..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 md:pl-12 text-sm md:text-lg w-full"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="relative flex-1 sm:flex-none">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input w-full sm:min-w-[180px] appearance-none cursor-pointer text-sm"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`btn flex items-center justify-center space-x-2 text-sm ${
                showFavorites ? "btn-primary" : "btn-secondary"
              }`}
            >
              <Star
                className={`w-4 h-4 ${showFavorites ? "fill-current" : ""}`}
              />
              <span>Favorites</span>
            </button>
          </div>
        </div>
      </div>

      {/* Passwords List */}
      {loading ? (
        <LoadingSpinner className="h-64" />
      ) : filteredPasswords.length > 0 ? (
        <div className="grid gap-6">
          {filteredPasswords.map((password, index) => (
            <div
              key={password._id}
              className="card p-4 md:p-8 hover:shadow-2xl transition-all duration-300 animate-scale-in group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-4 md:space-x-6 flex-1 min-w-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-105 md:group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0">
                    <Key className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 md:space-x-3 mb-2">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">
                        {password.title}
                      </h3>
                      {password.isFavorite && (
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-current" />
                        </div>
                      )}
                    </div>

                    <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 space-y-2 md:space-y-3">
                      {password.website && (
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <span className="text-gray-500 dark:text-gray-500 min-w-[50px] md:min-w-[60px] text-xs md:text-sm">
                            Website:
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white truncate flex-1">
                            {password.website}
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(password.website, "Website")
                            }
                            className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all duration-200 flex-shrink-0"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {password.email && (
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <span className="text-gray-500 dark:text-gray-500 min-w-[50px] md:min-w-[60px] text-xs md:text-sm">
                            Email:
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white truncate flex-1">
                            {password.email}
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(password.email, "Email")
                            }
                            className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all duration-200 flex-shrink-0"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 md:space-x-3">
                        <span className="text-gray-500 dark:text-gray-500 min-w-[50px] md:min-w-[60px] text-xs md:text-sm">
                          Password:
                        </span>
                        <span className="font-mono text-gray-900 dark:text-white text-xs md:text-sm truncate flex-1">
                          {visiblePasswords.has(password._id)
                            ? password.decryptedPassword || "••••••••"
                            : "••••••••"}
                        </span>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <button
                            onClick={() => handleViewPassword(password)}
                            className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all duration-200"
                            title={
                              visiblePasswords.has(password._id)
                                ? "Hide password"
                                : "View password"
                            }
                          >
                            {visiblePasswords.has(password._id) ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                          {visiblePasswords.has(password._id) &&
                            password.decryptedPassword && (
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    password.decryptedPassword,
                                    "Password"
                                  )
                                }
                                className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all duration-200"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleFavorite(password)}
                    className={`p-2 md:p-3 rounded-lg md:rounded-xl transition-all duration-200 ${
                      password.isFavorite
                        ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                        : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                    }`}
                    title={
                      password.isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <Star
                      className={`w-3 h-3 md:w-4 md:h-4 ${
                        password.isFavorite ? "fill-current" : ""
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => handleEditPassword(password)}
                    className="p-2 md:p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg md:rounded-xl transition-all duration-200"
                    title="Edit password"
                  >
                    <Edit className="w-3 h-3 md:w-4 md:h-4" />
                  </button>

                  <button
                    onClick={() => handleDeletePassword(password)}
                    className="p-2 md:p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg md:rounded-xl transition-all duration-200"
                    title="Delete password"
                  >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 md:p-12 text-center">
          <Key className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-2">
            No passwords found
          </h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || selectedCategory !== "all" || showFavorites
              ? "Try adjusting your search or filters"
              : "Get started by adding your first password"}
          </p>
          <button
            onClick={() => {
              setSelectedPassword(null);
              setShowPasswordModal(true);
            }}
            className="btn-primary text-sm"
          >
            Add Password
          </button>
        </div>
      )}

      {/* Modals */}
      {showPasswordModal && (
        <PasswordModal
          password={selectedPassword}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedPassword(null);
          }}
          onSave={handlePasswordSaved}
        />
      )}

      {showMasterPasswordModal && (
        <MasterPasswordModal
          onClose={() => {
            setShowMasterPasswordModal(false);
            setPendingAction(null);
          }}
          onVerify={handleMasterPasswordVerified}
        />
      )}
    </div>
  );
};

export default Passwords;
