"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/utils";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function AboutPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAboutContent() {
      setLoading(true);
      try {
        const response = await fetchApi("/content/about");
        setContent(response.data);
      } catch (error) {
        console.error("Failed to fetch about page content:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAboutContent();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-2/3 mx-auto mb-6" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-3/4 mb-10 mx-auto" />
          <Skeleton className="w-full h-[400px] mb-10 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <main>
      {/* Hero section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            About Natural supp
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
            Your trusted partner for high-quality nutritional supplements and
            fitness products.
          </p>
        </div>
      </section>

      {/* Our story section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                  Our Story
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p>
                    Founded in 2015, GenuineNutrition started with a simple
                    mission: to provide high-quality nutritional supplements
                    that actually work, backed by science and free from harmful
                    additives.
                  </p>
                  <p>
                    Our founder, Rahul Sharma, was frustrated with the lack of
                    transparency in the supplements industry. After struggling
                    to find products he could trust, he decided to create his
                    own solution.
                  </p>
                  <p>
                    Today, we&apos;ve grown into one of India&apos;s most
                    trusted supplement brands, with a commitment to quality,
                    transparency, and customer satisfaction that remains as
                    strong as ever.
                  </p>
                </div>
              </div>
              <div className="relative h-[400px] rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/images/about-story.jpg"
                  alt="Our founder in our first store"
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our values section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">
              Our Values
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-center">Quality</h3>
                <p className="text-gray-600 text-center">
                  We never compromise on quality. Every product is rigorously
                  tested to ensure it meets our high standards.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-center">
                  Transparency
                </h3>
                <p className="text-gray-600 text-center">
                  We believe in complete transparency about what goes into our
                  products and how they&apos;re made.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-center">
                  Customer First
                </h3>
                <p className="text-gray-600 text-center">
                  Our customers are at the heart of everything we do. Your
                  satisfaction is our top priority.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">
              Meet Our Team
            </h2>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-5 rounded-full overflow-hidden">
                  <Image
                    src="/images/team-1.jpg"
                    alt="Rahul Sharma - Founder & CEO"
                    fill
                    sizes="192px"
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold">Rahul Sharma</h3>
                <p className="text-primary font-medium">Founder & CEO</p>
              </div>

              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-5 rounded-full overflow-hidden">
                  <Image
                    src="/images/team-2.jpg"
                    alt="Priya Patel - Chief Nutritionist"
                    fill
                    sizes="192px"
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold">Priya Patel</h3>
                <p className="text-primary font-medium">Chief Nutritionist</p>
              </div>

              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-5 rounded-full overflow-hidden">
                  <Image
                    src="/images/team-3.jpg"
                    alt="Arjun Kapoor - Head of Product"
                    fill
                    sizes="192px"
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold">Arjun Kapoor</h3>
                <p className="text-primary font-medium">Head of Product</p>
              </div>

              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-5 rounded-full overflow-hidden">
                  <Image
                    src="/images/team-4.jpg"
                    alt="Meera Singh - Customer Experience"
                    fill
                    sizes="192px"
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold">Meera Singh</h3>
                <p className="text-primary font-medium">Customer Experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom content from CMS if available */}
      {content && content.content && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <div dangerouslySetInnerHTML={{ __html: content.content }} />
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
