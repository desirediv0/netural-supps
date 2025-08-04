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
} from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#2C3E50] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* About PowerFuel */}
          <div>
            <div className="mb-6">
              <Image
                src="/logo.png"
                alt="PowerFuel Logo"
                width={120}
                height={140}
                className="mb-4"
              />
            </div>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              PowerFuel is India&apos;s premium fitness nutrition brand,
              dedicated to providing high-quality supplements and nutritional
              products to help you achieve your fitness goals.
            </p>
            {/* Social media links */}
            <div className="flex space-x-2">
              {[
                { icon: <Instagram size={16} />, href: "#" },
                { icon: <Facebook size={16} />, href: "#" },
                { icon: <Twitter size={16} />, href: "#" },
                { icon: <Youtube size={16} />, href: "#" },
              ].map((social, idx) => (
                <Link
                  key={idx}
                  href={social.href}
                  className="w-8 h-8 bg-gray-600 hover:bg-[#ce801f] flex items-center justify-center rounded text-white transition-colors duration-300"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-2">
              Contact Us
            </h3>
            <div className="w-12 h-1 bg-[#ce801f] mb-6"></div>
            <div className="space-y-4 text-sm">
              <div className="flex items-start">
                <MapPin
                  size={16}
                  className="text-[#ce801f] mr-3 mt-1 flex-shrink-0"
                />
                <span className="text-gray-300">
                  A-36, Sector 83, Noida - 201305, Uttar Pradesh (India)
                </span>
              </div>

              <div className="flex items-center">
                <Mail size={16} className="text-[#ce801f] mr-3 flex-shrink-0" />
                <span className="text-gray-300">support@powerfuel.in</span>
              </div>

              <div className="flex items-center">
                <Phone
                  size={16}
                  className="text-[#ce801f] mr-3 flex-shrink-0"
                />
                <span className="text-gray-300">+91 8800 123 456</span>
              </div>

              <div className="flex items-start">
                <div className="w-4 h-4 flex items-center justify-center mr-3 mt-1">
                  <div className="w-2 h-2 bg-[#ce801f] rounded-full"></div>
                </div>
                <div className="text-gray-300">
                  <div className="font-medium">Open Hours:</div>
                  <div>Mon - Sat: 9:00 AM - 8:00 PM</div>
                </div>
              </div>
            </div>
            {/* Quick Links */}
            <div className="mt-8">
              <h4 className="text-white font-medium mb-3">Quick Links</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-[#ce801f] transition-colors"
                >
                  About Us
                </Link>
                <Link
                  href="/blog"
                  className="text-gray-300 hover:text-[#ce801f] transition-colors"
                >
                  Blog
                </Link>
                <Link
                  href="/careers"
                  className="text-gray-300 hover:text-[#ce801f] transition-colors"
                >
                  Careers
                </Link>
                <Link
                  href="/faq"
                  className="text-gray-300 hover:text-[#ce801f] transition-colors"
                >
                  FAQs
                </Link>
                <Link
                  href="/privacy"
                  className="text-gray-300 hover:text-[#ce801f] transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-gray-300 hover:text-[#ce801f] transition-colors"
                >
                  Terms & Conditions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-600 py-4">
        <div className="container mx-auto px-4">
          <p className="text-gray-400 text-center text-sm">
            © PowerFuel 2025 | All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
