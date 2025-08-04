"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  Heart,
  ChevronDown,
  Phone,
  LogIn,
  Star,
  Package,
  Truck,
  Shield,
  Sparkles,
  Home,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRouter, usePathname } from "next/navigation";
import { fetchApi } from "@/lib/utils";
import { ClientOnly } from "./client-only";
import { toast, Toaster } from "sonner";
import Image from "next/image";
import { motion } from "framer-motion";
import { logo } from "@/assets";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isHoveringDropdown, setIsHoveringDropdown] = useState(null);
  const searchInputRef = useRef(null);
  const navbarRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchExpanded(false);
    setActiveDropdown(null);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsSearchExpanded(false);
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetchApi("/public/categories");
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchExpanded(false);
      setIsMenuOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    window.location.href = "/";
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleDropdownHover = (dropdown) => {
    setIsHoveringDropdown(dropdown);
    if (dropdown === "categories" || dropdown === "account") {
      setActiveDropdown(dropdown);
    }
  };

  const handleDropdownLeave = () => {
    setIsHoveringDropdown(null);
    setTimeout(() => {
      if (!isHoveringDropdown) {
        setActiveDropdown(null);
      }
    }, 100);
  };

  const MobileMenu = ({
    isMenuOpen,
    setIsMenuOpen,
    categories,
    searchQuery,
    setSearchQuery,
    handleSearch,
    isAuthenticated,
    user,
    cart,
    handleLogout,
  }) => {
    const handleMobileSearch = (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
        setIsMenuOpen(false);
        setSearchQuery("");
      }
    };

    const handleSearchInputChange = (e) => {
      setSearchQuery(e.target.value);
    };

    if (!isMenuOpen) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm h-[85vh] rounded-b-md">
        <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className=" px-6 py-6">
              <div className="flex items-center justify-between mb-6">
                <Image
                  src="/logo.png"
                  alt="Natural Supps"
                  width={150}
                  height={60}
                  className="h-10 object-contain"
                />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-black hover:bg-white/20 rounded-xl transition-all duration-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Search */}
              <form onSubmit={handleMobileSearch} className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white/50"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 py-6 space-y-6">
              {/* Quick Actions */}
              <div className="grid gap-3">
                <Link
                  href="/"
                  className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-lg transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="h-5 w-5 text-orange-600" />
                  <span className="font-semibold text-gray-800">Home</span>
                </Link>

                <Link
                  href="/products"
                  className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-lg transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Package className="h-5 w-5 text-orange-600" />
                  <span className="font-semibold text-gray-800">
                    All Products
                  </span>
                </Link>

                <Link
                  href="/wishlist"
                  className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-lg transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="h-5 w-5 text-orange-600" />
                  <span className="font-semibold text-gray-800">Wishlist</span>
                </Link>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-orange-500" />
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="block py-3 px-4 rounded-lg hover:bg-orange-50 hover:text-orange-600 text-gray-700 transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-2">
                {[
                  { href: "/blog", label: "Health Blog", icon: Star },
                  { href: "/about", label: "About Us", icon: Shield },
                  { href: "/shipping", label: "Shipping Policy", icon: Truck },
                  { href: "/contact", label: "Contact Us", icon: Phone },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5 text-orange-500" />
                    <span className="font-medium text-gray-800">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Account Section */}
              {isAuthenticated ? (
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                  <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center">
                    <User className="h-5 w-5 mr-2 text-orange-500" />
                    My Account
                  </h3>
                  <div className="space-y-2">
                    {[
                      { href: "/account", label: "Profile" },
                      { href: "/account/orders", label: "My Orders" },
                      { href: "/wishlist", label: "My Wishlist" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block py-3 px-4 rounded-lg hover:bg-orange-200/50 text-gray-700 transition-all duration-300"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block py-3 px-4 text-red-600 hover:text-red-700 w-full text-left transition-all duration-300 rounded-lg hover:bg-red-50 mt-4"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full py-4 text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <LogIn className="h-5 w-5 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full py-4 text-lg bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <User className="h-5 w-5 mr-2" />
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <header
      className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-100"
      ref={navbarRef}
    >
      <Toaster position="top-center" />

      {/* Top bar */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 text-center text-sm font-medium relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        <div className="relative z-10 flex items-center justify-center gap-4 capitalize">
          <Truck className="h-5 w-5 animate-bounce" />
          <span className="font-semibold">
            Shop for ₹999+ and receive a scratch card with exciting rewards!
          </span>
          <Shield className="h-5 w-5" />
        </div>
      </div>

      {/* Main navbar */}
      <div className="bg-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            {/* Menu toggle for mobile */}
            <div className="flex items-center md:hidden gap-3">
              <button
                className="p-3 text-gray-600 hover:text-orange-500 transition-all duration-300 focus:outline-none hover:scale-110 bg-gray-100 rounded-xl hover:bg-orange-50"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <Image
                  src="/logo.png"
                  width={200}
                  height={200}
                  alt="Natural Supps"
                  className="h-14 transition-all duration-300 group-hover:scale-110 object-contain"
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/products"
                className="font-semibold text-gray-700 hover:text-orange-500 transition-all duration-300 hover:scale-105 relative group px-3 py-2 rounded-lg hover:bg-orange-50"
              >
                All Products
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></div>
              </Link>

              {/* Categories dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleDropdownHover("categories")}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  className={`font-semibold px-3 py-2 rounded-lg transition-all duration-300 flex items-center focus:outline-none group relative ${
                    activeDropdown === "categories"
                      ? "text-orange-500 bg-orange-50"
                      : "text-gray-700 hover:text-orange-500 hover:bg-orange-50"
                  }`}
                  onClick={() => toggleDropdown("categories")}
                  aria-expanded={activeDropdown === "categories"}
                >
                  Categories
                  <ChevronDown
                    className={`ml-2 h-4 w-4 transition-all duration-300 ${
                      activeDropdown === "categories" ? "rotate-180" : ""
                    } group-hover:rotate-180`}
                  />
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></div>
                </button>
                <div
                  className={`absolute left-0 top-full mt-2 w-80 bg-white shadow-2xl rounded-2xl py-4 border border-gray-100 z-50 transition-all duration-300 ease-in-out transform origin-top ${
                    activeDropdown === "categories"
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-95 -translate-y-4 pointer-events-none"
                  }`}
                >
                  <div className="px-6 py-3 border-b border-gray-100">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center">
                      <Star className="h-5 w-5 mr-2 text-orange-500" />
                      Categories
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {categories.map((category) => (
                      <div key={category.id}>
                        <Link
                          href={`/category/${category.slug}`}
                          className="block px-6 py-4 hover:bg-orange-50 hover:text-orange-600 transition-all duration-300 group"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mr-4 group-hover:scale-150 transition-transform duration-300"></div>
                            <span className="font-medium">{category.name}</span>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-3 border-t border-gray-100">
                    <Link
                      href="/categories"
                      className="block text-orange-500 font-semibold hover:text-orange-600 transition-colors duration-300"
                      onClick={() => setActiveDropdown(null)}
                    >
                      View All Categories →
                    </Link>
                  </div>
                </div>
              </div>

              {[
                { href: "/blog", label: "Blog" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-semibold text-gray-700 hover:text-orange-500 transition-all duration-300 hover:scale-105 relative group px-3 py-2 rounded-lg hover:bg-orange-50"
                >
                  {item.label}
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></div>
                </Link>
              ))}
            </nav>

            {/* Search, Cart, Account */}
            <div className="flex items-center space-x-4 md:space-x-6">
              {/* Search button/form - hidden on mobile */}
              <div className="relative hidden md:block">
                {isSearchExpanded ? (
                  <>
                    <div
                      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                      onClick={() => setIsSearchExpanded(false)}
                    />
                    <div className="fixed inset-x-0 top-0 z-50 w-full animate-in slide-in-from-top duration-500 p-4">
                      <form
                        onSubmit={handleSearch}
                        className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[70vh] md:max-w-[500px] mx-auto"
                      >
                        <div className="flex items-center px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-500 to-orange-600">
                          <h3 className="text-lg font-bold text-white flex items-center">
                            <Search className="h-5 w-5 mr-2" />
                            Search Premium Products
                          </h3>
                          <button
                            type="button"
                            className="ml-auto p-2 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-110"
                            onClick={() => setIsSearchExpanded(false)}
                            aria-label="Close search"
                          >
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </div>

                        <div className="p-6">
                          <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              ref={searchInputRef}
                              type="search"
                              placeholder="Search for premium supplements..."
                              className="w-full pl-12 pr-20 py-4 border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl text-base bg-gray-50"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              autoComplete="off"
                            />
                            {searchQuery && (
                              <button
                                type="button"
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                onClick={() => setSearchQuery("")}
                                aria-label="Clear search"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between">
                          <button
                            type="button"
                            onClick={() => setIsSearchExpanded(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:scale-105"
                          >
                            <Search className="h-4 w-4" />
                            Search
                          </button>
                        </div>
                      </form>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setIsSearchExpanded(true)}
                    className="p-3 text-gray-600 hover:text-orange-500 transition-all duration-300 focus:outline-none hover:scale-110 bg-gray-100 rounded-xl hover:bg-orange-50"
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Cart */}
              <ClientOnly>
                <Link
                  href="/cart"
                  className="p-3 text-gray-600 hover:text-orange-500 transition-all duration-300 relative bg-gray-100 rounded-xl hover:bg-orange-50 hover:scale-110"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cart && cart.items?.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {cart.items.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  )}
                </Link>
              </ClientOnly>

              {/* Account dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleDropdownHover("account")}
                onMouseLeave={handleDropdownLeave}
              >
                <ClientOnly>
                  <button
                    className={`p-3 rounded-xl transition-all duration-300 flex items-center focus:outline-none hover:scale-110 ${
                      activeDropdown === "account"
                        ? "text-orange-500 bg-orange-50"
                        : "text-gray-600 bg-gray-100 hover:text-orange-500 hover:bg-orange-50"
                    }`}
                    onClick={() => toggleDropdown("account")}
                    aria-expanded={activeDropdown === "account"}
                  >
                    {isAuthenticated ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <LogIn className="h-5 w-5" />
                    )}
                    <ChevronDown
                      className={`ml-2 h-4 w-4 transition-all duration-300 ${
                        activeDropdown === "account" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`absolute right-0 top-full mt-2 w-80 bg-white shadow-2xl rounded-2xl py-4 border border-gray-100 z-50 transition-all duration-300 ease-in-out transform origin-top ${
                      activeDropdown === "account"
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 -translate-y-4 pointer-events-none"
                    }`}
                  >
                    {isAuthenticated ? (
                      <>
                        <div className="px-6 py-4 border-b border-gray-100 mb-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-2xl">
                          <p className="font-bold text-gray-800 text-lg">
                            Hi, {user?.name || "User"}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>
                        <div className="space-y-2">
                          {[
                            {
                              href: "/account",
                              label: "My Account",
                              icon: User,
                            },
                            {
                              href: "/account/orders",
                              label: "My Orders",
                              icon: Package,
                            },
                            {
                              href: "/wishlist",
                              label: "My Wishlist",
                              icon: Heart,
                            },
                          ].map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center px-6 py-4 hover:bg-orange-50 hover:text-orange-600 transition-all duration-300"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <item.icon className="h-5 w-5 mr-4 text-gray-400" />
                              <span className="font-medium">{item.label}</span>
                            </Link>
                          ))}
                        </div>
                        <div className="px-6 py-3 border-t border-gray-100 mt-2">
                          <button
                            onClick={() => {
                              handleLogout();
                              setActiveDropdown(null);
                            }}
                            className="flex items-center w-full text-left text-red-600 hover:text-red-700 transition-all duration-300 font-medium"
                          >
                            <LogIn className="h-5 w-5 mr-4 rotate-180" />
                            Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="px-6 py-6">
                        <div className="space-y-4">
                          <Link
                            href="/login"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <Button className="w-full py-4 hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl shadow-lg font-semibold">
                              <LogIn className="h-5 w-5 mr-2" />
                              Login
                            </Button>
                          </Link>
                          <Link
                            href="/register"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <Button
                              variant="outline"
                              className="w-full py-4 hover:scale-105 transition-transform duration-300 text-orange-500 border-orange-500 hover:bg-orange-50 hover:text-gray-800 rounded-xl font-semibold"
                            >
                              <User className="h-5 w-5 mr-2" />
                              Register
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </ClientOnly>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <ClientOnly>
        <MobileMenu
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          categories={categories}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          isAuthenticated={isAuthenticated}
          user={user}
          cart={cart}
          handleLogout={handleLogout}
        />
      </ClientOnly>

      {/* Enhanced Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 z-50 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />

        <div className="relative grid grid-cols-5 gap-1 px-2 py-3">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-300 group ${
              pathname === "/"
                ? "text-orange-500 bg-orange-50 shadow-lg"
                : "text-gray-600 hover:text-orange-500 hover:bg-gray-50"
            }`}
          >
            <div
              className={`relative ${
                pathname === "/" ? "scale-110" : "group-hover:scale-110"
              } transition-transform duration-300`}
            >
              <Home className="h-6 w-6" />
              {pathname === "/" && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              )}
            </div>
            <span
              className={`text-xs mt-1 font-medium ${
                pathname === "/" ? "text-orange-500" : "text-gray-600"
              }`}
            >
              Home
            </span>
          </Link>

          {/* Products */}
          <Link
            href="/products"
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-300 group ${
              pathname === "/products"
                ? "text-orange-500 bg-orange-50 shadow-lg"
                : "text-gray-600 hover:text-orange-500 hover:bg-gray-50"
            }`}
          >
            <div
              className={`relative ${
                pathname === "/products" ? "scale-110" : "group-hover:scale-110"
              } transition-transform duration-300`}
            >
              <Package className="h-6 w-6" />
              {pathname === "/products" && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              )}
            </div>
            <span
              className={`text-xs mt-1 font-medium ${
                pathname === "/products" ? "text-orange-500" : "text-gray-600"
              }`}
            >
              Products
            </span>
          </Link>

          {/* Cart with badge */}
          <Link
            href="/cart"
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-300 group relative ${
              pathname === "/cart"
                ? "text-orange-500 bg-orange-50 shadow-lg"
                : "text-gray-600 hover:text-orange-500 hover:bg-gray-50"
            }`}
          >
            <div
              className={`relative ${
                pathname === "/cart" ? "scale-110" : "group-hover:scale-110"
              } transition-transform duration-300`}
            >
              <ShoppingCart className="h-6 w-6" />
              {cart && cart.items?.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold animate-bounce shadow-lg">
                  {cart.items.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
              {pathname === "/cart" && (
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              )}
            </div>
            <span
              className={`text-xs mt-1 font-medium ${
                pathname === "/cart" ? "text-orange-500" : "text-gray-600"
              }`}
            >
              Cart
            </span>
          </Link>

          {/* Account */}
          <Link
            href={isAuthenticated ? "/account" : "/login"}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-300 group ${
              pathname.includes("/account") || pathname === "/login"
                ? "text-orange-500 bg-orange-50 shadow-lg"
                : "text-gray-600 hover:text-orange-500 hover:bg-gray-50"
            }`}
          >
            <div
              className={`relative ${
                pathname.includes("/account") || pathname === "/login"
                  ? "scale-110"
                  : "group-hover:scale-110"
              } transition-transform duration-300`}
            >
              {isAuthenticated ? (
                <User className="h-6 w-6" />
              ) : (
                <LogIn className="h-6 w-6" />
              )}
              {(pathname.includes("/account") || pathname === "/login") && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              )}
            </div>
            <span
              className={`text-xs mt-1 font-medium ${
                pathname.includes("/account") || pathname === "/login"
                  ? "text-orange-500"
                  : "text-gray-600"
              }`}
            >
              {isAuthenticated ? "Account" : "Login"}
            </span>
          </Link>

          {/* Logo - Main Site Link */}
          <a
            href="https://genuinenutrition.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-1"
          >
            <div className="transition-transform duration-300">
              <Image
                src={logo}
                alt="Genuine Nutrition"
                width={100}
                height={100}
                className="h-full w-full object-contain"
              />
            </div>
          </a>
        </div>

        {/* Bottom safe area for devices with home indicator */}
        <div className="h-1 bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-orange-500/20" />
      </div>
    </header>
  );
}
