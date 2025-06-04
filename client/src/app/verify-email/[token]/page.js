"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClientOnly } from "@/components/client-only";
import {
  CheckCircle,
  XCircle,
  Mail,
  ArrowRight,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Helper function to check if token was already verified in this session
const wasTokenVerifiedInSession = (token) => {
  if (typeof window === "undefined") return false;

  try {
    const verified = localStorage.getItem(`verified_${token}`);
    return verified === "true";
  } catch (e) {
    console.error("Error checking token verification status:", e);
    return false;
  }
};

// Helper function to mark token as verified in this session
const markTokenAsVerifiedInSession = (token) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(`verified_${token}`, "true");
  } catch (e) {
    console.error("Failed to mark token as verified in session", e);
  }
};

export default function VerifyEmailPage({ params }) {
  const router = useRouter();
  const { token } = params;
  const { verifyEmail, resendVerification } = useAuth();
  const [status, setStatus] = useState("initial"); // initial, verifying, success, error, resent
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  // Use a ref to ensure verification is only attempted once
  const verificationAttemptedRef = useRef(false);
  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);

  // Auto redirect after successful verification
  useEffect(() => {
    let timer;
    if (status === "success" && redirectCountdown > 0) {
      timer = setTimeout(() => {
        if (isMounted.current) {
          setRedirectCountdown((prev) => prev - 1);
        }
      }, 1000);
    } else if (status === "success" && redirectCountdown === 0) {
      router.push("/login");
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [status, redirectCountdown, router]);

  useEffect(() => {
    // Set mounted flag
    isMounted.current = true;

    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Skip if no token or already attempted verification
    if (!token || verificationAttemptedRef.current) {
      return;
    }

    // Set verification attempted flag to prevent multiple attempts
    verificationAttemptedRef.current = true;

    // Check if this token was already verified in this session
    if (wasTokenVerifiedInSession(token)) {
      if (isMounted.current) {
        console.log("Token already verified in this session");
        setStatus("success");
        setMessage("Your email has been verified successfully.");
      }
      return;
    }

    const verify = async () => {
      // Set state to verifying
      if (isMounted.current) {
        setStatus("verifying");
      }

      try {
        const response = await verifyEmail(token);

        // Mark token as verified AFTER successful verification
        markTokenAsVerifiedInSession(token);

        // Only update state if component is still mounted
        if (isMounted.current) {
          setStatus("success");
          setMessage(response.message || "Email verified successfully");
        }
      } catch (error) {
        console.error("Verification error:", error);

        // Only update state if component is still mounted
        if (!isMounted.current) return;

        // Special case: If the error is that the email was already verified,
        // treat it as a success and mark as verified in session
        if (
          error.message &&
          (error.message.toLowerCase().includes("already verified") ||
            error.message.includes("Verification already attempted"))
        ) {
          markTokenAsVerifiedInSession(token);
          setStatus("success");
          setMessage("Your email has already been verified");
        } else {
          setStatus("error");
          setMessage(
            error.message ||
              "Unable to verify email. The token may be invalid or expired."
          );
        }
      }
    };

    // Start verification process
    verify();
  }, [token, verifyEmail]);

  const handleResendVerification = async (e) => {
    e.preventDefault();
    if (!email) return;

    setResending(true);
    try {
      await resendVerification(email);

      if (isMounted.current) {
        setStatus("resent");
        setMessage(
          "Verification email has been resent. Please check your inbox."
        );
      }
    } catch (error) {
      if (isMounted.current) {
        setMessage(error.message || "Failed to resend verification email");
      }
    } finally {
      if (isMounted.current) {
        setResending(false);
      }
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
                Email Verification
              </h1>
              <p className="text-yellow-100">Verifying your email address</p>
            </div>

            {/* Content Section */}
            <div className="px-8 py-8">
              <ClientOnly
                fallback={<div className="py-8 text-center">Loading...</div>}
              >
                {(status === "initial" || status === "verifying") && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">Verifying your email...</p>
                  </div>
                )}

                {status === "success" && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-gray-800">
                      Email Verified!
                    </h2>
                    <p className="text-green-600 font-medium mb-2">{message}</p>
                    <p className="text-gray-600 mb-4">
                      Your email has been verified successfully.
                    </p>
                    <p className="text-sm text-gray-500 mb-8">
                      Redirecting to login in {redirectCountdown} seconds...
                    </p>
                    <Link href="/login">
                      <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105">
                        Continue to Login
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}

                {status === "error" && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                      <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-gray-800">
                      Verification Failed
                    </h2>
                    <p className="text-red-600 font-medium mb-2">{message}</p>
                    <p className="text-gray-600 mb-6">
                      Please check if you clicked the correct link or try
                      resending the verification email.
                    </p>

                    <div className="w-full max-w-xs">
                      <form
                        onSubmit={handleResendVerification}
                        className="space-y-4"
                      >
                        <div>
                          <Input
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
                          disabled={resending || !email}
                          className="w-full h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                        >
                          {resending ? (
                            <div className="flex items-center space-x-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Sending...</span>
                            </div>
                          ) : (
                            "Resend Verification Email"
                          )}
                        </Button>
                      </form>
                    </div>

                    <Link
                      href="/register"
                      className="mt-6 text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
                    >
                      Back to Registration
                    </Link>
                  </div>
                )}

                {status === "resent" && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                      <Mail className="h-8 w-8 text-green-500" />
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-gray-800">
                      Email Sent!
                    </h2>
                    <p className="text-green-600 font-medium mb-2">{message}</p>
                    <p className="text-gray-600 mb-8">
                      Please check your email for the verification link.
                    </p>
                    <Link
                      href="/login"
                      className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
                    >
                      Back to Login
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
