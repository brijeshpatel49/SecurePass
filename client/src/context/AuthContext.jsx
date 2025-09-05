import { createContext, useContext, useReducer, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_USER":
      return { ...state, user: action.payload, loading: false, error: null };
    case "SET_TOKEN":
      return { ...state, token: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "LOGOUT":
      return { ...state, user: null, token: null, loading: false, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const user = await authService.getCurrentUser();
          dispatch({ type: "SET_USER", payload: user });
        } catch (error) {
          localStorage.removeItem("token");
          dispatch({ type: "LOGOUT" });
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);

      if (response.requiresTwoFactor) {
        return {
          success: true,
          requiresTwoFactor: true,
          message: response.message,
        };
      }

      const { user, token } = response.data;
      localStorage.setItem("token", token);
      dispatch({ type: "SET_TOKEN", payload: token });
      dispatch({ type: "SET_USER", payload: user });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await authService.register(userData);

      // Initial registration only returns success message and email
      // User and token will be set after OTP verification
      dispatch({ type: "SET_LOADING", payload: false });

      return {
        success: true,
        message: response?.message || "Registration initiated successfully",
        email: response?.email || userData.email,
      };
    } catch (error) {
      console.error("Registration error:", error);
      dispatch({ type: "SET_ERROR", payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
  };

  const verifyMasterPassword = async (masterPassword) => {
    try {
      await authService.verifyMasterPassword(masterPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const resendRegistrationOTP = async (email) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await authService.resendRegistrationOTP(email);

      dispatch({ type: "SET_LOADING", payload: false });
      return {
        success: true,
        message: response?.message || "New verification code sent",
      };
    } catch (error) {
      console.error("Resend OTP error:", error);
      dispatch({ type: "SET_ERROR", payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const completeRegistration = async (email, otp) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await authService.verifyRegistrationOTP(email, otp);

      // The API interceptor returns response.data, so we get { success: true, user: {...}, token: '...' }
      const userData = response?.user;
      const tokenData = response?.token;

      if (userData && tokenData) {
        localStorage.setItem("token", tokenData);
        dispatch({ type: "SET_TOKEN", payload: tokenData });
        dispatch({ type: "SET_USER", payload: userData });
        return { success: true };
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      dispatch({ type: "SET_ERROR", payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: "SET_USER", payload: userData });
  };

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    login,
    register,
    resendRegistrationOTP,
    completeRegistration,
    logout,
    verifyMasterPassword,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
