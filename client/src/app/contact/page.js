"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Send,
  MessageCircle,
  Users,
  HeadphonesIcon,
} from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    async function fetchContactInfo() {
      setLoading(true);
      try {
        const response = await fetchApi("/content/contact");
        setContactInfo(response.data);
      } catch (error) {
        console.error("Failed to fetch contact info:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchContactInfo();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const response = await fetchApi("/content/contact", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      toast.success(response.data.message || "Your message has been sent!");

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
      <main className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full mb-6">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Get in Touch
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Have a question or need support? Our team is here to help you on
                your fitness journey!
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-8">
              {/* Contact Form - 3 columns */}
              <div className="md:col-span-3">
                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
                  <div className="flex items-center mb-8">
                    <div className="bg-yellow-100 p-3 rounded-xl mr-4">
                      <Send className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        Send us a Message
                      </h2>
                      <p className="text-gray-600">
                        We&apos;ll get back to you within 24 hours
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Your Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter your name"
                          className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-yellow-500 transition-colors"
                        />
                      </div>
                      <div>
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
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter your email"
                          className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-yellow-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Phone Number
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                          className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-yellow-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="subject"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Subject
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="What is this regarding?"
                          className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-yellow-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Message <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        placeholder="How can we help you?"
                        rows={6}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-yellow-500 transition-colors resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                      disabled={formLoading}
                    >
                      {formLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Send className="h-4 w-4" />
                          <span>Send Message</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </div>
              </div>

              {/* Contact Information - 2 columns */}
              <div className="md:col-span-2 space-y-6">
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-32 mb-4" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-10 w-32 mt-6 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                      <div className="flex items-center mb-6">
                        <div className="bg-yellow-100 p-3 rounded-xl mr-4">
                          <HeadphonesIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            Contact Information
                          </h3>
                          <p className="text-gray-600">
                            Reach out to us anytime
                          </p>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="flex items-start">
                          <div className="bg-yellow-50 p-2 rounded-lg mr-4">
                            <MapPin className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              Address
                            </p>
                            <p className="text-gray-600">
                              {contactInfo?.address ||
                                "123 Supplement Street, Health City, 400001"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-yellow-50 p-2 rounded-lg mr-4">
                            <Phone className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">Phone</p>
                            <p className="text-gray-600">
                              {contactInfo?.phone || "+91 98765 43210"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-yellow-50 p-2 rounded-lg mr-4">
                            <Mail className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">Email</p>
                            <p className="text-gray-600">
                              {contactInfo?.email || "support@powerfitness.com"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-yellow-50 p-2 rounded-lg mr-4">
                            <Clock className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              Business Hours
                            </p>
                            <p className="text-gray-600">
                              {contactInfo?.hours ||
                                "Monday - Saturday: 10:00 AM - 7:00 PM"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                      <div className="flex items-center mb-6">
                        <div className="bg-yellow-100 p-3 rounded-xl mr-4">
                          <Users className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            Follow Us
                          </h3>
                          <p className="text-gray-600">
                            Stay connected with our community
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <a
                          href={
                            contactInfo?.socialLinks?.facebook ||
                            "https://facebook.com/powerfitness"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-110"
                          aria-label="Facebook"
                        >
                          <Facebook className="h-5 w-5" />
                        </a>
                        <a
                          href={
                            contactInfo?.socialLinks?.instagram ||
                            "https://instagram.com/powerfitness"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gradient-to-br from-pink-500 to-purple-600 p-3 rounded-xl text-white hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-110"
                          aria-label="Instagram"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                        <a
                          href={
                            contactInfo?.socialLinks?.twitter ||
                            "https://twitter.com/powerfitness"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gradient-to-br from-blue-400 to-blue-500 p-3 rounded-xl text-white hover:from-blue-500 hover:to-blue-600 transition-all duration-200 transform hover:scale-110"
                          aria-label="Twitter"
                        >
                          <Twitter className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Map */}
            <div className="mt-12">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Find Us
                </h3>
                <div className="bg-gray-100 rounded-xl overflow-hidden h-[400px] mb-4">
                  <iframe
                    src={`https://maps.google.com/maps?q=${
                      contactInfo?.mapCoordinates?.lat || 19.076
                    },${
                      contactInfo?.mapCoordinates?.lng || 72.8777
                    }&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    title="Power Fitness Location"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                <p className="text-center text-gray-600">
                  Visit our store at{" "}
                  {contactInfo?.address ||
                    "123 Supplement Street, Health City, 400001"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
