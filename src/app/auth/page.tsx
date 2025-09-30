"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SignupForm from "../../components/auth/SignupForm";
import LoginForm from "../../components/auth/LoginForm";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative">
      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="font-medium">Back to Home</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Supersheet
          </h1>
          <p className="text-gray-600">
            {isLogin ? "Sign in to your account" : "Create your account to get started"}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <LoginForm />
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <SignupForm />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          By continuing, you agree to our{" "}
          <a href="#" className="text-blue-600 hover:text-blue-700">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-600 hover:text-blue-700">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}