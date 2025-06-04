"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ShoppingBag, Zap } from "lucide-react";
import { AuthRedirect } from "@/components/auth-redirect";
import { toast, Toaster } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email, password);
      sessionStorage.setItem("justLoggedIn", "true");
      toast.success("Login successful! Redirecting...");

      const returnUrl = searchParams.get("returnUrl");
      setTimeout(() => {
        window.location.href = returnUrl ? decodeURIComponent(returnUrl) : "/";
      }, 300);
    } catch (error) {
      const errorMessage =
        error.message || "Login failed. Please check your credentials.";

      if (
        errorMessage.toLowerCase().includes("verify") ||
        errorMessage.toLowerCase().includes("verification")
      ) {
        toast.error(
          <div>
            {errorMessage}{" "}
            <Link
              href="/resend-verification"
              className="text-white font-medium underline"
            >
              Resend verification email
            </Link>
          </div>
        );
      } else {
        toast.error(errorMessage);
      }
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

        <div className="flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Welcome Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-8 py-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Welcome Back!
                </h1>
                <p className="text-yellow-100">
                  Sign in to continue your fitness journey
                </p>
              </div>

              {/* Form Section */}
              <div className="px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-yellow-500 transition-colors"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label
                          htmlFor="password"
                          className="block text-sm font-semibold text-gray-700"
                        >
                          Password
                        </label>
                        <Link
                          href="/forgot-password"
                          className="text-sm text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
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
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-4 text-sm text-gray-500 bg-white">
                    New to Power Fitness?
                  </span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>

                {/* Register Link */}
                <div className="text-center">
                  <Link href="/register">
                    <Button
                      variant="outline"
                      className="w-full h-12 border-2 border-yellow-200 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-300 font-semibold rounded-xl transition-all duration-200"
                    >
                      Create New Account
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                By signing in, you agree to our{" "}
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
