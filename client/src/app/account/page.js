"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientOnly } from "@/components/client-only";
import { fetchApi, formatDate } from "@/lib/utils";
import { ProtectedRoute } from "@/components/protected-route";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Bell,
  ShieldCheck,
  CreditCard,
  Gift,
  Package,
  Heart,
} from "lucide-react";

export default function AccountPage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    profileImage: null,
  });
  const [preview, setPreview] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        profileImage: null,
      });
    }
  }, [user]);

  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;

      try {
        const response = await fetchApi("/users/addresses", {
          credentials: "include",
        });
        setAddresses(response.data.addresses || []);
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      }
    };

    fetchAddresses();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profileImage" && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        profileImage: files[0],
      }));

      // Create preview URL
      const file = files[0];
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      await updateProfile(formData);
      setIsEditing(false);
      setMessage({
        type: "success",
        text: "Profile updated successfully",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update profile",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <ProtectedRoute>
      <ClientOnly>
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Welcome Banner */}
          <motion.div
            className="relative overflow-hidden bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-3xl shadow-lg"
            variants={itemVariants}
          >
            <div className="absolute right-0 top-0 w-64 h-64 bg-yellow-400 rounded-full -translate-y-1/2 translate-x-1/3 opacity-30"></div>
            <div className="absolute left-0 bottom-0 w-40 h-40 bg-yellow-400 rounded-full translate-y-1/2 -translate-x-1/3 opacity-30"></div>

            <div className="relative p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    Welcome back, {user?.name || "User"}!
                  </h1>
                  <p className="text-yellow-100 text-lg">
                    Manage your profile, orders, and preferences
                  </p>
                </div>
                <div className="mt-6 md:mt-0">
                  <div className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="h-10 w-10 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Notification */}
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border flex items-center ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              )}
              <p>{message.text}</p>
            </motion.div>
          )}

          {/* Profile Information Card */}
          <motion.div
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            variants={itemVariants}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                  <User className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Personal Information
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Manage your personal details
                  </p>
                </div>
              </div>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>

            <div className="p-6">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="flex items-center text-sm font-medium text-gray-700 mb-2"
                      >
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        Full Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className="h-12 rounded-xl"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="flex items-center text-sm font-medium text-gray-700 mb-2"
                      >
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="h-12 rounded-xl"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end pt-6 border-t border-gray-100">
                    <Button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setPreview(null);
                        setFormData({
                          name: user?.name || "",
                          phone: user?.phone || "",
                          profileImage: null,
                        });
                      }}
                      variant="outline"
                      className="px-6 py-2 h-11"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 h-11 bg-yellow-600 hover:bg-yellow-700"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      Full Name
                    </p>
                    <p className="text-lg font-medium text-gray-800">
                      {user?.name || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      Email Address
                    </p>
                    <p className="text-lg font-medium text-gray-800">
                      {user?.email || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      Phone Number
                    </p>
                    <p className="text-lg font-medium text-gray-800">
                      {user?.phone || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      Member Since
                    </p>
                    <p className="text-lg font-medium text-gray-800">
                      {user?.createdAt ? formatDate(user.createdAt) : "Unknown"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Account Actions */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            variants={itemVariants}
          >
            <Link href="/account/addresses" className="group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-amber-200 transition-colors">
                    <MapPin className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">
                      Manage Addresses
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Add or edit your delivery addresses
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/account/orders" className="group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">
                      View Orders
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Track and manage your orders
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/account/change-password" className="group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors">
                    <ShieldCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">
                      Security Settings
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Change your password
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </ClientOnly>
    </ProtectedRoute>
  );
}
