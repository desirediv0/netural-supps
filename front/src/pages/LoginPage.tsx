"use client";

import type React from "react";

import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Loader2, Shield, Mail, Lock } from "lucide-react";
import { loginbg } from "@/assets";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate inputs
    if (!email.trim()) {
      setFormError("Email is required");
      return;
    }
    if (!password) {
      setFormError("Password is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
    } catch (error: any) {
      console.error("Login error:", error);
      setFormError(error.message || "Failed to login. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-orange-50 via-white to-orange-50 overflow-hidden">
      {/* Left Side - Single Image with Hover Overlay */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-orange-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-orange-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-orange-500 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        {/* Brand Logo/Title */}
        <div className="absolute top-8 left-8 z-20">
          <div className="flex items-center space-x-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-2xl">
                Natural Supps
              </h1>
              <p className="text-sm text-orange-100 font-medium">
                Admin Portal
              </p>
            </div>
          </div>
        </div>

        {/* Single Hero Image */}
        <div className="flex-1 relative group overflow-hidden cursor-pointer">
          <img
            src={loginbg}
            alt="Natural Supps - Premium Supplements"
            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
          />

          {/* Enhanced Overlay with orange tint */}
          <div className="absolute inset-0 bg-gradient-to-t from-orange-500/90 via-orange-500/50 to-transparent opacity-80 group-hover:opacity-95 transition-all duration-500" />

          {/* Text Overlay */}
          <div className="absolute inset-0 flex items-center justify-center p-8 text-white">
            <div className="text-center max-w-lg transform translate-y-8 group-hover:translate-y-0 transition-all duration-700">
              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 opacity-95 group-hover:opacity-100 transition-all duration-500 delay-200 drop-shadow-2xl">
                Natural Supps
              </h2>
              <p className="text-xl lg:text-2xl opacity-90 group-hover:opacity-100 transition-all duration-500 delay-300 leading-relaxed font-light">
                Premium Supplements for Your Fitness Journey
              </p>

              {/* Enhanced Decorative Line */}
              <div className="w-32 h-1 bg-white mx-auto mt-8 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-400 transform scale-x-0 group-hover:scale-x-100 origin-center"></div>
            </div>
          </div>

          {/* Enhanced Decorative Elements */}
          <div className="absolute top-12 right-12 w-20 h-20 border-2 border-white/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 delay-300 transform scale-0 group-hover:scale-100">
            <Shield className="w-10 h-10 text-white" />
          </div>

          {/* Bottom Corner Accent */}
          <div className="absolute bottom-12 left-12 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-400">
            <div className="flex items-center space-x-3 text-white/95">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="text-base font-semibold">Admin Access</span>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-orange-500/60 to-transparent pointer-events-none" />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8 bg-white/80 backdrop-blur-sm">
        <div className="w-full max-w-lg space-y-10">
          {/* Mobile Brand Header */}
          <div className="lg:hidden text-center mb-10">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 shadow-2xl">
                <Package className="h-9 w-9 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Natural Supps
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  Admin Portal
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Login Form Header */}
          <div className="text-center space-y-4">
            <div className="hidden lg:flex lg:justify-center lg:mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-500/80 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Welcome Back
            </h2>
            <p className="text-base text-gray-600 max-w-sm mx-auto">
              Enter your credentials to access the admin dashboard
            </p>
          </div>

          {/* Enhanced Error Display */}
          {(error || formError) && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-5 text-center transform animate-in slide-in-from-top-2">
              <p className="text-sm text-red-600 font-medium">
                {formError || error}
              </p>
            </div>
          )}

          {/* Enhanced Login Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@naturalsupps.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="h-14 text-base pl-12 pr-4 border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl transition-all duration-300 hover:border-gray-300"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="h-14 text-base pl-12 pr-4 border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl transition-all duration-300 hover:border-gray-300"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-500/90 hover:from-orange-500/90 hover:to-orange-500 focus:ring-orange-500 cursor-pointer shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02] rounded-xl"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="mr-3 h-6 w-6" />
                  Sign in to Dashboard
                </>
              )}
            </Button>
          </form>

          {/* Enhanced Footer */}
          <div className="text-center pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 font-medium">
              © 2025 Natural Supps. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Secure admin access portal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
