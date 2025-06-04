"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { ClientOnly } from "@/components/client-only";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, ArrowRight, CheckCircle, ShoppingBag } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
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
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-8 py-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Resend Verification
              </h1>
              <p className="text-yellow-100">
                Get a new verification link sent to your email
              </p>
            </div>

            {/* Content Section */}
            <div className="px-8 py-8">
              <ClientOnly
                fallback={<div className="py-8 text-center">Loading...</div>}
              >
                {(status === "idle" || status === "error") && (
                  <div>
                    <p className="mb-6 text-gray-600 text-center">
                      Enter your email address below and we&apos;ll send you a
                      new verification link.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Email Address
                        </label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-yellow-500 transition-colors"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                        disabled={status === "submitting"}
                      >
                        {status === "submitting" ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Sending...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>Send Verification Email</span>
                          </div>
                        )}
                      </Button>
                    </form>

                    <div className="mt-6 text-center">
                      <Link
                        href="/login"
                        className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
                      >
                        Back to Login
                      </Link>
                    </div>
                  </div>
                )}

                {status === "submitting" && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">
                      Sending verification email...
                    </p>
                  </div>
                )}

                {status === "success" && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-gray-800">
                      Email Sent Successfully!
                    </h2>
                    <p className="text-green-600 font-medium mb-2">
                      Verification email sent successfully!
                    </p>
                    <p className="text-gray-600 mb-8">
                      Please check your email and click on the verification
                      link.
                    </p>
                    <Link href="/login">
                      <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105">
                        Back to Login
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
