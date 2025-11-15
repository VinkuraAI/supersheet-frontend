"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, User, Lock, AlertCircle, X, CheckCircle } from "lucide-react";
import apiClient from "@/utils/api.client";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

// Define type for backend validation errors
interface ValidationError {
  type: string;
  value: string;
  msg: string;
  path: string;
  location: string;
}

export default function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    // Clear general error when user starts typing
    if (generalError) {
      setGeneralError("");
    }
    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage("");
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }
    
    if (!formData.userName.trim()) {
      newErrors.userName = "User name is required";
    } else if (formData.userName.trim().length < 2) {
      newErrors.userName = "User name must be at least 2 characters";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const route = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setGeneralError("");
    setSuccessMessage("");
    
    try {
      const res = await apiClient.post("/users/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      
      // Show success message
      const message = res.data.message || "Account created successfully!";
      setSuccessMessage(message);
      
      // Clear form
      setFormData({
        name: "",
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        route.push("/auth?login=true");
      }, 2000);
    } catch (error) {
      if (error instanceof AxiosError) {
        const responseData = error.response?.data;
        
        // Check if backend returned validation errors array (from express-validator)
        if (responseData?.errors && Array.isArray(responseData.errors)) {
          const newErrors: Record<string, string> = {};
          
          // Map backend errors to form fields
          responseData.errors.forEach((err: ValidationError) => {
            const fieldName = err.path;
            const errorMessage = err.msg;
            
            // Map 'name' field from backend to 'userName' in frontend
            if (fieldName === 'name') {
              newErrors.userName = errorMessage;
            } else if (fieldName === 'email') {
              newErrors.email = errorMessage;
            } else if (fieldName === 'password') {
              newErrors.password = errorMessage;
            } else {
              // For any other errors, add to general error
              if (!newErrors.general) {
                newErrors.general = errorMessage;
              }
            }
          });
          
          setErrors(newErrors);
          
          // If there's a general error, set it
          if (newErrors.general) {
            setGeneralError(newErrors.general);
          }
        } 
        // Check if backend returned a single error object with "error" property
        else if (responseData?.error) {
          const errorMessage = responseData.error;
          
          // Check if it's an email-related error
          if (errorMessage.toLowerCase().includes("email")) {
            setErrors({ email: errorMessage });
          } else if (errorMessage.toLowerCase().includes("password")) {
            setErrors({ password: errorMessage });
          } else if (errorMessage.toLowerCase().includes("name")) {
            setErrors({ userName: errorMessage });
          } else {
            // Show as general error if we can't map it to a specific field
            setGeneralError(errorMessage);
          }
        }
        // Check if backend returned "message" property
        else if (responseData?.message) {
          const errorMessage = responseData.message;
          
          if (errorMessage.toLowerCase().includes("email") && errorMessage.toLowerCase().includes("exist")) {
            setErrors({ email: "This email is already registered" });
          } else if (errorMessage.toLowerCase().includes("email")) {
            setErrors({ email: errorMessage });
          } else {
            setGeneralError(errorMessage);
          }
        } 
        // Fallback for unknown error structure
        else {
          setGeneralError("Something went wrong. Please try again.");
        }
      } else {
        console.error("Signup error:", error);
        setGeneralError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignup = () => {
    console.log("Google signup");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Create Account
        </h2>
        <p className="text-gray-600">
          Join thousands of users already using Supersheet
        </p>
      </div>

      {/* General Error Banner */}
      <AnimatePresence>
        {generalError && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg p-4 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-red-800 mb-1">
                  Error Creating Account
                </h3>
                <p className="text-sm text-red-700 leading-relaxed">
                  {generalError}
                </p>
              </div>
              <button
                onClick={() => setGeneralError("")}
                className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                aria-label="Dismiss error"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message Banner */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative bg-gradient-to-r from-green-50 to-emerald-100 border-l-4 border-green-500 rounded-lg p-4 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-green-800 mb-1">
                  Account Created Successfully! 🎉
                </h3>
                <p className="text-sm text-green-700 leading-relaxed">
                  {successMessage}
                </p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Redirecting to login page...
                </p>
              </div>
              <button
                onClick={() => setSuccessMessage("")}
                className="flex-shrink-0 text-green-400 hover:text-green-600 transition-colors"
                aria-label="Dismiss success message"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Sign Up Button */}
      <button
        onClick={googleSignup}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            Or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          {/* Full Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                errors.name ? 'text-red-500' : 'text-gray-400'
              }`} />
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all placeholder:text-gray-500 ${
                  errors.name 
                    ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.name && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-1.5 mt-2 text-red-600"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-1 h-1 rounded-full bg-red-500" />
                </div>
                <p className="text-sm font-medium leading-tight">
                  {errors.name}
                </p>
              </motion.div>
            )}
          </div>

          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Name
            </label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                errors.userName ? 'text-red-500' : 'text-gray-400'
              }`} />
              <input
                name="userName"
                type="text"
                value={formData.userName}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all placeholder:text-gray-500 ${
                  errors.userName 
                    ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                }`}
                placeholder="Enter your user name"
              />
              {errors.userName && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.userName && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-1.5 mt-2 text-red-600"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-1 h-1 rounded-full bg-red-500" />
                </div>
                <p className="text-sm font-medium leading-tight">
                  {errors.userName}
                </p>
              </motion.div>
            )}
          </div>

        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
              errors.email ? 'text-red-500' : 'text-gray-400'
            }`} />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all placeholder:text-gray-500 ${
                errors.email 
                  ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              }`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
            )}
          </div>
          {errors.email && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-1.5 mt-2 text-red-600"
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-1 h-1 rounded-full bg-red-500" />
              </div>
              <p className="text-sm font-medium leading-tight">
                {errors.email}
              </p>
            </motion.div>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
              errors.password ? 'text-red-500' : 'text-gray-400'
            }`} />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition-all placeholder:text-gray-500 ${
                errors.password 
                  ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              }`}
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-1.5 mt-2 text-red-600"
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-1 h-1 rounded-full bg-red-500" />
              </div>
              <p className="text-sm font-medium leading-tight">
                {errors.password}
              </p>
            </motion.div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
              errors.confirmPassword ? 'text-red-500' : 'text-gray-400'
            }`} />
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition-all placeholder:text-gray-500 ${
                errors.confirmPassword 
                  ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              }`}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-1.5 mt-2 text-red-600"
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-1 h-1 rounded-full bg-red-500" />
              </div>
              <p className="text-sm font-medium leading-tight">
                {errors.confirmPassword}
              </p>
            </motion.div>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating Account...
            </div>
          ) : (
            "Create Account"
          )}
        </motion.button>
      </form>
    </div>
  );
}
