"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, ChevronRight, Heart, Eye } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import GymSupplementShowcase from "@/components/showcase";
import BenefitsSec from "@/components/benifit-sec";
import FeaturedCategoriesSection from "@/components/catgry";
import Headtext from "@/components/ui/headtext";
import ProductQuickView from "@/components/ProductQuickView";
import FeaturedProducts from "@/components/FeaturedProducts";

// Hero Carousel Component
const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState(null);
  const [autoplay, setAutoplay] = useState(true);

  const slides = [
    {
      title: "PREMIUM SUPPLEMENTS",
      subtitle: "Fuel your workouts with high-quality ingredients",
      cta: "SHOP NOW",
      ctaLink: "/products",
    },
    {
      title: "ADVANCED PROTEIN FORMULA",
      subtitle: "30g protein per serving with zero added sugar",
      cta: "EXPLORE",
      ctaLink: "/category/protein",
    },
  ];

  // Handle autoplay functionality
  useEffect(() => {
    if (!api || !autoplay) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [api, autoplay]);

  // Update current slide index when carousel changes
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentSlide(api.selectedScrollSnap());
    };

    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <div className="relative overflow-hidden h-[500px] md:h-[700px]">
      {/* Single background video that stays consistent across all slides */}
      <div className="absolute inset-0 w-full h-full z-0">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#ce801f]/20 backdrop-blur-[2px] z-10" />
      </div>

      <Carousel setApi={setApi} className="h-full relative z-20">
        <CarouselContent className="h-full">
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="h-full p-0">
              <div className="relative h-full w-full overflow-hidden flex items-center justify-center">
                {/* Content */}
                <div className="container mx-auto px-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl mx-auto text-center"
                  >
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mt-32 lg:mt-48 text-white mb-6 uppercase tracking-wider leading-tight">
                      {slide.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 mb-10 font-light">
                      {slide.subtitle}
                    </p>
                    <Link href={slide.ctaLink}>
                      <Button
                        size="lg"
                        className="text-lg px-8 lg:px-12 py-7 font-bold bg-[#ce801f] text-white hover:bg-[#ce801f]/90 hover:scale-105 transition-transform duration-200"
                      >
                        {slide.cta}
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Controls
        <CarouselPrevious
          className="left-8 h-10 w-10 z-30 opacity-70 hover:opacity-100"
          variant="secondary"
        />
        <CarouselNext
          className="right-8 h-10 w-10 z-30 opacity-70 hover:opacity-100"
          variant="secondary"
        /> */}

        {/* Dot Indicators */}
        <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-4 h-4 rounded-full transition-all transform ${
                index === currentSlide
                  ? "bg-white scale-100"
                  : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Autoplay Toggle */}
        <div className="absolute bottom-8 right-8 z-30">
          <Button
            variant="outline"
            size="sm"
            className="h-10 w-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full"
            onClick={() => setAutoplay(!autoplay)}
            aria-label={autoplay ? "Pause slideshow" : "Play slideshow"}
          >
            {autoplay ? (
              <span className="block w-3 h-3 bg-white"></span>
            ) : (
              <span className="block w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-white ml-0.5"></span>
            )}
          </Button>
        </div>
      </Carousel>
    </div>
  );
};

// Announcement Banner
const AnnouncementBanner = () => {
  return (
    <div className="bg-gradient-to-r from-[#ce801f]/5 via-[#ce801f]/10 to-[#ce801f]/5 py-4 overflow-hidden border-b border-[#ce801f]/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-full bg-[#ce801f]/10 flex items-center justify-center">
              ⚡
            </div>
            <span className="text-sm md:text-base font-medium">
              FREE SHIPPING ON ORDERS ABOVE ₹999
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              🎁
            </div>
            <span className="text-sm md:text-base font-medium">
              GET A FREE SHAKER WITH PROTEIN PURCHASES
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              🔥
            </div>
            <span className="text-sm md:text-base font-medium">
              USE CODE{" "}
              <strong className="text-[#ce801f]">FIT10</strong> FOR 10% OFF
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};



// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Ravi Sharma",
      role: "Fitness Enthusiast",
      avatar: "/avatar1.jpg",
      quote:
        "I've tried many supplements, but these products have truly made a difference in my training and recovery.",
      rating: 5,
    },
    {
      name: "Priya Patel",
      role: "Yoga Instructor",
      avatar: "/avatar2.jpg",
      quote:
        "The quality of these supplements is exceptional. I recommend them to all my clients looking for clean nutrition.",
      rating: 5,
    },
    {
      name: "Arjun Singh",
      role: "Bodybuilder",
      avatar: "/avatar3.jpg",
      quote:
        "These supplements have been a game-changer for my competition prep. Pure ingredients and great results!",
      rating: 5,
    },
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#ce801f]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ce801f]/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Headtext text="WHAT OUR CUSTOMERS SAY" />
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto text-lg">
            Real experiences from people who trust our products
          </p>
        </motion.div>

        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.2 }}
                className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>

                {/* Quote mark */}
                <div className="absolute top-6 right-6 text-6xl text-[#ce801f]/10 font-serif">
                  &quot;
                </div>

                {/* Content */}
                <div className="relative">
                  {/* Avatar and info */}
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 relative rounded-full overflow-hidden border-2 border-[#ce801f]/20 shadow-md">
                      <div className="w-full h-full bg-gradient-to-br from-[#ce801f] to-[#ce801f]/80 flex items-center justify-center text-white font-bold text-xl">
                        {testimonial.name.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {testimonial.name}
                      </h3>
                      <p className="text-sm text-[#ce801f] font-medium">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < testimonial.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-gray-700 text-lg leading-relaxed">
                    &quot;{testimonial.quote}&quot;
                  </p>

                  {/* Bottom design element */}
                  <div className="mt-8 flex justify-center">
                    <motion.div
                      className="h-1 w-12 bg-[#ce801f]/30 rounded-full"
                      whileHover={{ width: 60 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const ProductSkeleton = () => (
  <div className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
    <div className="aspect-square bg-gray-200"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
      <div className="h-8 bg-gray-200 rounded w-full"></div>
    </div>
  </div>
);

// Home page component
export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch featured products
    const fetchData = async () => {
      try {
        // Fetch products
        const productsRes = await fetchApi(
          "/public/products?featured=true&limit=8"
        );
        setFeaturedProducts(productsRes?.data?.products || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err?.message || "Failed to fetch data");
      } finally {
        setProductsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <HeroCarousel />
      {/* <AnnouncementBanner /> */}

      {/* Featured Categories Section */}
      <FeaturedCategoriesSection />

      {/* Featured Products Section */}
      {featuredProducts.length && (
        <section className="py-10 bg-gray-50">
          <div className="container mx-auto px-4">
            {/* <div className="text-center mb-12">
              <Headtext text="FEATURED PRODUCTS" />
              <p className="text-gray-600 my-6 max-w-2xl mx-auto">
                High-quality supplements to enhance your fitness journey
              </p>
            </div> */}

            <FeaturedProducts
              products={featuredProducts}
              isLoading={productsLoading}
              error={error}
            />
          </div>
        </section>
      )}

      <GymSupplementShowcase />
      <BenefitsSec />
      <TestimonialsSection />
    </div>
  );
}
