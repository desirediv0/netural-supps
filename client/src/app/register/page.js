"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ShoppingBag, UserPlus, CheckCircle } from "lucide-react";
import { toast, Toaster } from "sonner";
import { AuthRedirect } from "@/components/auth-redirect";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (formData.name.trim().length < 3) {
      toast.error("Name should be at least 3 characters");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 8) {
      toast.error("Password should be at least 8 characters");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      toast.success(
        "Registration successful! Please check your email to verify your account.",
        {
          duration: 5000,
        }
      );

      localStorage.setItem("registeredEmail", formData.email);

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthRedirect>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
        <Toaster position="top-center" />

        {/* Header with logo */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="bg-yellow-500 p-2 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  Power Fitness
                </span>
              </div>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-lg">
            {/* Registration Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-8 py-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                  <UserPlus className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Join Power Fitness
                </h1>
                <p className="text-yellow-100">
                  Start your fitness journey today
                </p>
              </div>

              {/* Form Section */}
              <div className="px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label
                        htmlFor="name"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-yellow-500 transition-colors"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-yellow-500 transition-colors"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label
                        htmlFor="phone"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-yellow-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create password"
                          className="w-full h-12 px-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-yellow-500 transition-colors"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-yellow-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                    <p className="text-sm text-yellow-800 font-medium mb-2">
                      Password Requirements:
                    </p>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3" />
                        <span>At least 8 characters long</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3" />
                        <span>Mix of letters and numbers recommended</span>
                      </li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-4 text-sm text-gray-500 bg-white">
                    Already have an account?
                  </span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>

                {/* Login Link */}
                <div className="text-center">
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="w-full h-12 border-2 border-yellow-200 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-300 font-semibold rounded-xl transition-all duration-200"
                    >
                      Sign In Instead
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                By creating an account, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthRedirect>
  );
}
