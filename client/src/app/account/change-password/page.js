"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientOnly } from "@/components/client-only";
import { fetchApi } from "@/lib/utils";
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Shield,
} from "lucide-react";

export default function ChangePasswordPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    // Check if current password is provided
    if (!formData.currentPassword) {
      setMessage({
        type: "error",
        text: "Current password is required",
      });
      return false;
    }

    // Check if new password meets requirements
    if (formData.newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "New password must be at least 8 characters long",
      });
      return false;
    }

    // Check if passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({
        type: "error",
        text: "New passwords do not match",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetchApi("/users/change-password", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      setMessage({
        type: "success",
        text: "Password changed successfully",
      });

      // Clear form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to change password. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
        <div className="container mx-auto py-10 flex justify-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
      <ClientOnly>
        <div className="container mx-auto py-10 px-4">
          <div className="flex items-center mb-8">
            <Link
              href="/account"
              className="inline-flex items-center text-sm text-gray-600 hover:text-yellow-600 mr-6 font-medium transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Account
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">
              Change Password
            </h1>
          </div>

          <div className="max-w-md mx-auto">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Security Settings</h2>
                  <p className="text-yellow-100">
                    Update your account password
                  </p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <Shield className="h-8 w-8" />
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-8 py-6 border-b border-yellow-200">
                <div className="flex items-center">
                  <div className="bg-yellow-500 p-3 rounded-xl mr-4">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Change Password
                    </h3>
                    <p className="text-gray-600">
                      Enter your current and new password
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {message.text && (
                  <div
                    className={`mb-6 p-4 rounded-xl border-2 flex items-center ${
                      message.type === "success"
                        ? "bg-green-50 text-green-800 border-green-200"
                        : "bg-red-50 text-red-800 border-red-200"
                    }`}
                  >
                    {message.type === "success" ? (
                      <CheckCircle className="h-5 w-5 mr-3" />
                    ) : (
                      <AlertCircle className="h-5 w-5 mr-3" />
                    )}
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="flex items-center text-sm font-semibold text-gray-700 mb-2"
                    >
                      <Lock className="h-4 w-4 mr-2 text-yellow-500" />
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPassword.current ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={handleChange}
                        required
                        className="h-12 px-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-yellow-500 transition-colors"
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => togglePasswordVisibility("current")}
                      >
                        {showPassword.current ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="flex items-center text-sm font-semibold text-gray-700 mb-2"
                    >
                      <Lock className="h-4 w-4 mr-2 text-yellow-500" />
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showPassword.new ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        minLength={8}
                        className="h-12 px-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-yellow-500 transition-colors"
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => togglePasswordVisibility("new")}
                      >
                        {showPassword.new ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="flex items-center text-sm font-semibold text-gray-700 mb-2"
                    >
                      <Lock className="h-4 w-4 mr-2 text-yellow-500" />
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword.confirm ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="h-12 px-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-yellow-500 transition-colors"
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => togglePasswordVisibility("confirm")}
                      >
                        {showPassword.confirm ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-3 h-5 w-5" />
                        Change Password
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </ClientOnly>
    </div>
  );
}
