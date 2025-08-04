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
  Sparkles,
  Loader2,
  Shield,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
          toast.success("Email verified successfully!");
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
          toast.success("Email already verified!");
        } else {
          setStatus("error");
          setMessage(
            error.message ||
              "Unable to verify email. The token may be invalid or expired."
          );
          toast.error("Email verification failed");
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
        toast.success("Verification email sent!");
      }
    } catch (error) {
      if (isMounted.current) {
        setMessage(error.message || "Failed to resend verification email");
        toast.error("Failed to resend verification email");
      }
    } finally {
      if (isMounted.current) {
        setResending(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Email Verification
          </h1>
          <p className="text-gray-600">Securing your Natural Supps account</p>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <ClientOnly
            fallback={
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Loading verification...</p>
              </div>
            }
          >
            {(status === "initial" || status === "verifying") && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Verifying Your Email
                </h2>
                <p className="text-gray-600 mb-4">
                  Please wait while we verify your email address...
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
                  Email Verified!
                </h2>
                <p className="text-green-600 font-medium mb-3">{message}</p>
                <p className="text-gray-600 mb-6">
                  Your account is now active and secure.
                </p>
                <div className="bg-orange-50 rounded-lg p-4 mb-6 w-full">
                  <p className="text-sm text-gray-700">
                    Redirecting to login in{" "}
                    <span className="font-bold text-orange-600">
                      {redirectCountdown}
                    </span>{" "}
                    seconds...
                  </p>
                </div>
                <Link href="/login">
                  <Button className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
                    Continue to Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6 shadow-lg">
                  <XCircle className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Verification Failed
                </h2>
                <p className="text-red-600 font-medium mb-3">{message}</p>
                <p className="text-gray-600 mb-8">
                  Please check if you clicked the correct link or try resending
                  the verification email.
                </p>

                <div className="w-full space-y-4">
                  <form
                    onSubmit={handleResendVerification}
                    className="space-y-4"
                  >
                    <div>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-orange-500 transition-colors"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={resending || !email}
                      className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resending ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Sending...
                        </div>
                      ) : (
                        "Resend Verification Email"
                      )}
                    </Button>
                  </form>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link
                    href="/register"
                    className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                  >
                    Back to Registration
                  </Link>
                </div>
              </div>
            )}

            {status === "resent" && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 shadow-lg">
                  <Mail className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Email Sent!
                </h2>
                <p className="text-green-600 font-medium mb-3">{message}</p>
                <p className="text-gray-600 mb-8">
                  Please check your email for the verification link.
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

        {/* Security Features */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  Secure Verification
                </h3>
                <p className="text-gray-600 text-xs">
                  Your account is protected with industry-standard security
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  Instant Access
                </h3>
                <p className="text-gray-600 text-xs">
                  Start shopping immediately after verification
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
