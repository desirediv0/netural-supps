import { motion } from "framer-motion";
import { Truck, Award, CreditCard, Heart, Shield } from "lucide-react";
import { useState } from "react";

export default function FeaturesSection() {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      icon: Truck,
      title: "Free Shipping",
      description: "On orders over ₹999",
      bgPattern:
        "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
    },
    {
      icon: Award,
      title: "100% Authentic",
      description: "Lab-tested products",
      bgPattern:
        "linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.05) 75%, transparent 75%, transparent)",
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description: "Multiple options",
      bgPattern:
        "repeating-linear-gradient(0deg, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 1px, transparent 1px, transparent 6px)",
    },
    {
      icon: Heart,
      title: "Customer Love",
      description: "Rated 4.8/5 by users",
      bgPattern:
        "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const iconVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.2,
      rotate: [0, -5, 5, -5, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          repeatType: "reverse",
          duration: 0.5,
        },
      },
    },
  };

  return (
    <section className="bg-[#1C4E80] relative py-12 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1C4E80]/80 to-[#1C4E80] opacity-80"></div>
      <div className="absolute inset-0 bg-[url('/api/placeholder/100/100')] bg-repeat opacity-5"></div>

      <motion.div
        className="container mx-auto px-4 relative z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="relative"
              variants={itemVariants}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <motion.div
                className="h-full backdrop-blur-sm rounded-xl overflow-hidden"
                animate={{
                  boxShadow:
                    hoveredFeature === index
                      ? "0 0 25px 5px rgba(255, 255, 255, 0.2)"
                      : "0 0 0 0 rgba(255, 255, 255, 0)",
                }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="flex flex-col items-center text-center h-full p-6 rounded-xl border border-white/20 bg-white/10 relative z-10 overflow-hidden"
                  style={{
                    backgroundImage:
                      hoveredFeature === index ? feature.bgPattern : "none",
                    backgroundSize: "12px 12px",
                  }}
                >
                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-white rounded-full opacity-0 blur-3xl"
                    animate={{
                      opacity: hoveredFeature === index ? 0.03 : 0,
                    }}
                    transition={{ duration: 0.5 }}
                  />

                  {/* Icon with animation */}
                  <motion.div
                    className="relative mb-4 p-4 rounded-full bg-[#F47C20] border border-white/20"
                    variants={iconVariants}
                    initial="initial"
                    animate={hoveredFeature === index ? "hover" : "initial"}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                    <motion.div
                      className="absolute inset-0 bg-white rounded-full opacity-0"
                      animate={{
                        opacity: hoveredFeature === index ? [0, 0.2, 0] : 0,
                        scale: hoveredFeature === index ? [1, 1.5, 1] : 1,
                      }}
                      transition={{
                        duration: 1,
                        repeat: hoveredFeature === index ? Infinity : 0,
                        repeatDelay: 2,
                      }}
                    />
                  </motion.div>

                  {/* Title with animation */}
                  <motion.h3
                    className="text-lg font-bold text-white mb-1"
                    animate={{
                      color: hoveredFeature === index ? "#ffffff" : "#f8f8f8",
                    }}
                  >
                    {feature.title}
                  </motion.h3>

                  {/* Description */}
                  <p className="text-sm text-white/80">{feature.description}</p>

                  {/* Animated bottom border */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-[#F47C20]"
                    initial={{ width: 0 }}
                    animate={{
                      width: hoveredFeature === index ? "100%" : "0%",
                      opacity: hoveredFeature === index ? 0.8 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional trust badge at the bottom */}
        <motion.div
          className="mt-10 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#F47C20] border border-white/20">
            <Shield className="h-5 w-5 text-white" />
            <span className="text-sm text-white font-medium">
              Trusted by 10,000+ fitness enthusiasts
            </span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
