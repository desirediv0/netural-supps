"use client";

import Link from "next/link";
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Clock,
  Shield,
  Truck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Natural Supps */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Image
                src="/logo.png"
                alt="Natural Supps Logo"
                width={150}
                height={60}
                className="mb-4"
              />
            </div>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              Natural Supps is India&apos;s premium health supplements brand,
              dedicated to providing high-quality nutritional products backed by
              science. We help you achieve optimal health and wellness with
              FDA-approved supplements.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="w-4 h-4 text-orange-500" />
                <span className="text-gray-300">FDA Approved</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="w-4 h-4 text-orange-500" />
                <span className="text-gray-300">Fast Delivery</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="text-gray-300">Premium Quality</span>
              </div>
            </div>

            {/* Social media links */}
            <div className="flex space-x-3">
              {[
                {
                  icon: <Instagram size={18} />,
                  href: "#",
                  label: "Instagram",
                },
                { icon: <Facebook size={18} />, href: "#", label: "Facebook" },
                { icon: <Twitter size={18} />, href: "#", label: "Twitter" },
                { icon: <Youtube size={18} />, href: "#", label: "YouTube" },
              ].map((social, idx) => (
                <Link
                  key={idx}
                  href={social.href}
                  className="w-10 h-10 bg-gray-700 hover:bg-orange-500 flex items-center justify-center rounded-lg text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  aria-label={social.label}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <div className="w-12 h-1 bg-orange-500 mb-6 rounded-full"></div>
            <div className="space-y-3 text-sm">
              <Link
                href="/products"
                className="block text-gray-300 hover:text-orange-400 transition-colors duration-300 hover:translate-x-1"
              >
                All Products
              </Link>
              <Link
                href="/categories"
                className="block text-gray-300 hover:text-orange-400 transition-colors duration-300 hover:translate-x-1"
              >
                Categories
              </Link>
              <Link
                href="/blog"
                className="block text-gray-300 hover:text-orange-400 transition-colors duration-300 hover:translate-x-1"
              >
                Health Blog
              </Link>
              <Link
                href="/about"
                className="block text-gray-300 hover:text-orange-400 transition-colors duration-300 hover:translate-x-1"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="block text-gray-300 hover:text-orange-400 transition-colors duration-300 hover:translate-x-1"
              >
                Contact
              </Link>
              <Link
                href="/faqs"
                className="block text-gray-300 hover:text-orange-400 transition-colors duration-300 hover:translate-x-1"
              >
                FAQs
              </Link>
            </div>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contact Us</h3>
            <div className="w-12 h-1 bg-orange-500 mb-6 rounded-full"></div>
            <div className="space-y-4 text-sm">
              <div className="flex items-start">
                <MapPin
                  size={16}
                  className="text-orange-500 mr-3 mt-1 flex-shrink-0"
                />
                <span className="text-gray-300">
                  89/2 Sector 39, Gurugram, Haryana, India
                </span>
              </div>

              <div className="flex items-center">
                <Mail
                  size={16}
                  className="text-orange-500 mr-3 flex-shrink-0"
                />
                <span className="text-gray-300">support@naturalsupps.com</span>
              </div>

              <div className="flex items-center">
                <Phone
                  size={16}
                  className="text-orange-500 mr-3 flex-shrink-0"
                />
                <span className="text-gray-300">+91 8053210008</span>
              </div>

              <div className="flex items-start">
                <Clock
                  size={16}
                  className="text-orange-500 mr-3 mt-1 flex-shrink-0"
                />
                <div className="text-gray-300">
                  <div className="font-medium">Open Hours:</div>
                  <div>Mon - Sat: 10:00 AM - 7:00 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Shield className="w-8 h-8 text-orange-500 mb-2" />
              <h4 className="text-white font-semibold mb-1">Secure Shopping</h4>
              <p className="text-gray-400 text-sm">
                SSL encrypted transactions
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="w-8 h-8 text-orange-500 mb-2" />
              <h4 className="text-white font-semibold mb-1">Fast Delivery</h4>
              <p className="text-gray-400 text-sm">
                Free shipping on orders above ₹999
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Sparkles className="w-8 h-8 text-orange-500 mb-2" />
              <h4 className="text-white font-semibold mb-1">Premium Quality</h4>
              <p className="text-gray-400 text-sm">FDA-approved supplements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-700 py-6 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 Natural Supps. All Rights Reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-orange-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-orange-400 transition-colors"
              >
                Terms & Conditions
              </Link>
              <Link
                href="/shipping"
                className="text-gray-400 hover:text-orange-400 transition-colors"
              >
                Shipping Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
