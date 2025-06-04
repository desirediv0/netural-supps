"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, HelpCircle, Filter, MessageCircle, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function FAQsPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState(["all"]);

  useEffect(() => {
    async function fetchFAQs() {
      setLoading(true);
      try {
        const response = await fetchApi("/faqs");

        // Handle various possible response formats
        let faqsData = [];
        if (response?.data?.faqs && Array.isArray(response.data.faqs)) {
          faqsData = response.data.faqs;
        } else if (Array.isArray(response?.data)) {
          faqsData = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          faqsData = response.data.data;
        }

        setFaqs(faqsData);
        setFilteredFaqs(faqsData);

        // Fetch categories
        const categoriesResponse = await fetchApi("/faqs/categories");

        let categoriesData = [];
        if (categoriesResponse?.data?.categories) {
          categoriesData = categoriesResponse.data.categories;
        } else if (Array.isArray(categoriesResponse?.data)) {
          categoriesData = categoriesResponse.data;
        } else if (
          categoriesResponse?.data?.data &&
          Array.isArray(categoriesResponse.data.data)
        ) {
          categoriesData = categoriesResponse.data.data;
        }

        if (categoriesData.length) {
          setCategories(["all", ...categoriesData.map((cat) => cat.name)]);
        }
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFAQs();
  }, []);

  // Filter FAQs based on search query and category
  useEffect(() => {
    if (!faqs.length) return;

    let filtered = faqs;

    // Filter by category if not "all"
    if (activeCategory !== "all") {
      filtered = filtered.filter((faq) => faq.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
    }

    // Sort by order (ascending)
    filtered = [...filtered].sort((a, b) => a.order - b.order);

    setFilteredFaqs(filtered);
  }, [searchQuery, activeCategory, faqs]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-10 w-1/2 mx-auto mb-6" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-3/4 mb-10 mx-auto" />

            <Skeleton className="h-12 w-full mb-8" />

            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border rounded-md p-2">
                  <Skeleton className="h-8 w-full mb-2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
      <main className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full mb-6">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Find answers to common questions about our products, ordering,
                shipping, and more.
              </p>
            </div>

            {/* Search bar */}
            <div className="relative max-w-lg mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-3 h-12 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 transition-colors"
                />
              </div>
            </div>

            {/* Category filters */}
            {categories.length > 1 && (
              <div className="mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Filter className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-600">
                    Filter by category
                  </span>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                        activeCategory === category
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg transform scale-105"
                          : "bg-white text-gray-700 border-2 border-gray-200 hover:border-yellow-300 hover:bg-yellow-50"
                      }`}
                    >
                      {category === "all" ? "All Questions" : category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Accordion */}
            {filteredFaqs.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq, index) => (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id.toString()}
                      className={`${
                        index !== filteredFaqs.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                    >
                      <AccordionTrigger className="text-lg font-semibold py-6 px-6 hover:no-underline hover:bg-yellow-50 transition-colors text-left">
                        <span className="flex items-start">
                          <span className="bg-yellow-100 text-yellow-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-4 mt-0.5 flex-shrink-0">
                            {index + 1}
                          </span>
                          {faq.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 pt-2 text-gray-600 leading-relaxed">
                        <div className="ml-10">
                          <div
                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-xl font-semibold mb-2 text-gray-800">
                  No FAQs found for &quot;{searchQuery}&quot;
                </p>
                <span className="text-gray-600">
                  Try a different search term or{" "}
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory("all");
                    }}
                    className="text-yellow-600 hover:text-yellow-700 font-medium underline"
                  >
                    view all FAQs
                  </button>
                </span>
              </div>
            )}

            {/* Contact section */}
            <div className="mt-12 bg-gradient-to-r from-yellow-500 to-yellow-600 p-8 rounded-2xl text-center text-white shadow-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
              <p className="text-yellow-100 mb-8 max-w-md mx-auto">
                Can&apos;t find the answer you&apos;re looking for? Our support
                team is here to help!
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="/contact">
                  <Button className="bg-white text-yellow-600 hover:bg-gray-100 px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Us
                  </Button>
                </a>
                <a href="mailto:support@powerfitness.com">
                  <Button
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-yellow-600 px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
