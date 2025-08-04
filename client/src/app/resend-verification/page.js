"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { ClientOnly } from "@/components/client-only";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Mail,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Shield,
  Clock,
} from "lucide-react";

export default function ResendVerificationPage() {
  const { resendVerification } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, submitting, success, error

  // Check for stored email from registration
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("registeredEmail");
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setStatus("submitting");
    try {
      await resendVerification(email);
      setStatus("success");
      toast.success(
        "Verification email has been sent. Please check your inbox.",
        {
          duration: 5000,
        }
      );

      // Clear stored email
      if (typeof window !== "undefined") {
        localStorage.removeItem("registeredEmail");
      }
    } catch (error) {
      setStatus("error");
      toast.error(error.message || "Failed to send verification email");
      // Reset status after showing error
      setTimeout(() => setStatus("idle"), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Resend Verification
          </h1>
          <p className="text-gray-600">
            Get a new verification link sent to your email
          </p>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <ClientOnly
            fallback={
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            }
          >
            {(status === "idle" || status === "error") && (
              <div>
                <p className="mb-6 text-gray-600 text-center">
                  Enter your email address below and we&apos;ll send you a new
                  verification link.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="pl-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                    disabled={status === "submitting"}
                  >
                    {status === "submitting" ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Verification Email
                      </div>
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                  <Link
                    href="/login"
                    className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            )}

            {status === "submitting" && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Sending Email
                </h2>
                <p className="text-gray-600 mb-4">
                  Please wait while we send the verification email...
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>This may take a few seconds</span>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 shadow-lg">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Email Sent Successfully!
                </h2>
                <p className="text-green-600 font-medium mb-3">
                  Verification email sent successfully!
                </p>
                <p className="text-gray-600 mb-6">
                  Please check your email and click on the verification link.
                </p>

                <div className="bg-orange-50 rounded-lg p-4 mb-6 w-full">
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    <span>Don't forget to check your spam folder</span>
                  </div>
                </div>

                <Link href="/login">
                  <Button className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
                    Back to Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </ClientOnly>
        </div>

        {/* Help Section */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  Secure Process
                </h3>
                <p className="text-gray-600 text-xs">
                  Your email is protected and verification links are secure
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  Quick Delivery
                </h3>
                <p className="text-gray-600 text-xs">
                  Verification emails are sent instantly
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
