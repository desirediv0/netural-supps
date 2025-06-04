"use client";

import { motion } from "framer-motion";
import Headtext from "./ui/headtext";
import Link from "next/link";
import Image from "next/image";

const BenefitsSec = () => {
  const benefits = [
    {
      title: "Premium Quality",
      description:
        "Lab-tested supplements made with high-quality ingredients for maximum effectiveness.",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
    },
    {
      title: "Fast Delivery",
      description:
        "Get your supplements delivered to your doorstep within 2-3 business days.",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
          />
        </svg>
      ),
    },
    {
      title: "Expert Support",
      description:
        "Our team of fitness experts is available to help you choose the right supplements.",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      title: "Secure Payments",
      description: "Shop with confidence with our 100% secure payment gateway.",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-20">
          <Headtext text="WHY CHOOSE US" />
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto text-lg">
            We&apos;re committed to providing you with the best fitness
            supplements
          </p>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left side - image */}
          <motion.div
            className="relative overflow-hidden hidden md:block h-full"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/80 to-yellow-800/90 z-10 flex items-center justify-center">
              <div className="text-white p-12 max-w-md">
                <h3 className="text-3xl font-bold mb-6 leading-tight">
                  The highest quality for your fitness journey
                </h3>
                <p className="mb-6 text-yellow-100">
                  We carefully source and formulate each product to ensure you
                  get the best results for your fitness goals.
                </p>
                <Link href="/about">
                  <button className="px-8 py-4 bg-white text-yellow-600 font-semibold rounded-xl hover:bg-yellow-50 transition-all duration-300 transform hover:scale-105">
                    LEARN MORE
                  </button>
                </Link>
              </div>
            </div>
            <Image
              width={1000}
              height={1000}
              src="https://images.unsplash.com/photo-1534258936925-c58bed479fcb?q=80&w=1000"
              alt="Fitness supplements"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Right side - benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-start">
                  <div className="mr-5 mt-1">
                    <motion.div
                      className="text-yellow-500 bg-yellow-100 p-3 rounded-xl"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      {benefit.icon}
                    </motion.div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-yellow-600 transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { number: "100%", label: "Quality Tested" },
            { number: "1000+", label: "Happy Customers" },
            { number: "50+", label: "Products" },
            { number: "24/7", label: "Customer Support" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100"
            >
              <motion.h4
                className="text-4xl font-bold text-yellow-600 mb-2"
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                viewport={{ once: true }}
              >
                {stat.number}
              </motion.h4>
              <p className="text-gray-600 uppercase tracking-wide text-sm font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSec;
