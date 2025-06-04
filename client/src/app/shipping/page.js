"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Truck, Clock, Shield, Package, MapPin, Phone } from "lucide-react";

export default function ShippingPolicyPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShippingPolicy() {
      setLoading(true);
      try {
        const response = await fetchApi("/content/shipping");
        setContent(response.data);
      } catch (error) {
        console.error("Failed to fetch shipping policy:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchShippingPolicy();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-10 w-1/2 mx-auto mb-6" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-3/4 mb-10" />
            <Skeleton className="h-6 w-1/3 mb-3" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-5/6 mb-6" />
            <Skeleton className="h-6 w-1/3 mb-3" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-4/6 mb-6" />
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
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Shipping Policy
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Fast, reliable delivery to get your supplements to you quickly
                and safely
              </p>
            </div>

            {/* Quick Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl mb-4">
                  <Package className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Free Shipping</h3>
                <p className="text-gray-600 text-sm">
                  On all orders above ₹999
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl mb-4">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Fast Delivery</h3>
                <p className="text-gray-600 text-sm">
                  1-3 days in metro cities
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl mb-4">
                  <Shield className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">
                  Secure Packaging
                </h3>
                <p className="text-gray-600 text-sm">
                  Safe & damage-free delivery
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Render dynamic content if available */}
              {content && content.content ? (
                <div className="p-8">
                  <div
                    className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-a:text-yellow-600 prose-strong:text-gray-800"
                    dangerouslySetInnerHTML={{ __html: content.content }}
                  />
                </div>
              ) : (
                <div className="p-8">
                  <div className="prose prose-lg max-w-none">
                    <section className="mb-10">
                      <div className="flex items-center mb-4">
                        <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                          <Truck className="h-5 w-5 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          Delivery Information
                        </h2>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        At Power Fitness, we strive to deliver your orders as
                        quickly and efficiently as possible. We understand that
                        when you order nutritional supplements, you want them
                        right away. That&apos;s why we&apos;ve partnered with
                        reliable courier services to ensure your products reach
                        you in perfect condition.
                      </p>
                    </section>

                    <section className="mb-10">
                      <div className="flex items-center mb-4">
                        <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                          <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          Delivery Timeframes
                        </h2>
                      </div>
                      <p className="text-gray-600 mb-4">
                        We process all orders within 24 hours of receiving them
                        (excluding weekends and holidays). The estimated
                        delivery times are as follows:
                      </p>
                      <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
                        <ul className="space-y-3">
                          <li className="flex items-center">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                            <strong className="text-gray-800">
                              Metro Cities (Delhi, Mumbai, Bangalore, Chennai,
                              Hyderabad, Kolkata):
                            </strong>
                            <span className="ml-2 text-gray-600">
                              1-3 business days
                            </span>
                          </li>
                          <li className="flex items-center">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                            <strong className="text-gray-800">
                              Tier 2 Cities:
                            </strong>
                            <span className="ml-2 text-gray-600">
                              2-4 business days
                            </span>
                          </li>
                          <li className="flex items-center">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                            <strong className="text-gray-800">
                              Other regions:
                            </strong>
                            <span className="ml-2 text-gray-600">
                              3-5 business days
                            </span>
                          </li>
                          <li className="flex items-center">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                            <strong className="text-gray-800">
                              Remote areas:
                            </strong>
                            <span className="ml-2 text-gray-600">
                              5-7 business days
                            </span>
                          </li>
                        </ul>
                      </div>
                      <p className="text-gray-600 mt-4">
                        Please note that these are estimated delivery timeframes
                        and may vary depending on your location and other
                        external factors.
                      </p>
                    </section>

                    <section className="mb-10">
                      <div className="flex items-center mb-4">
                        <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                          <Package className="h-5 w-5 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          Shipping Fees
                        </h2>
                      </div>
                      <p className="text-gray-600 mb-4">
                        We offer the following shipping options:
                      </p>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                          <h4 className="font-bold text-green-800 mb-2">
                            Free Shipping
                          </h4>
                          <p className="text-green-700 text-sm">
                            On all orders above ₹999
                          </p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                          <h4 className="font-bold text-blue-800 mb-2">
                            Standard Shipping
                          </h4>
                          <p className="text-blue-700 text-sm">
                            ₹99 for orders below ₹999
                          </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                          <h4 className="font-bold text-purple-800 mb-2">
                            Express Shipping
                          </h4>
                          <p className="text-purple-700 text-sm">
                            ₹199 (24-48 hours in select metros)
                          </p>
                        </div>
                      </div>
                    </section>

                    <section className="mb-10">
                      <div className="flex items-center mb-4">
                        <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                          <MapPin className="h-5 w-5 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          Order Tracking
                        </h2>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Once your order is shipped, you will receive a
                        confirmation email with your tracking information. You
                        can track your order by:
                      </p>
                      <ol className="space-y-2 text-gray-600">
                        <li className="flex items-start">
                          <span className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                            1
                          </span>
                          Logging into your account and viewing your order
                          history
                        </li>
                        <li className="flex items-start">
                          <span className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                            2
                          </span>
                          Using the tracking link provided in your shipping
                          confirmation email
                        </li>
                        <li className="flex items-start">
                          <span className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                            3
                          </span>
                          Contacting our customer support team with your order
                          number
                        </li>
                      </ol>
                    </section>

                    <section className="mb-10">
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        International Shipping
                      </h2>
                      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                        <p className="text-blue-800">
                          Currently, we only ship within India. We are working
                          to expand our shipping capabilities to other countries
                          in the near future.
                        </p>
                      </div>
                    </section>

                    <section className="mb-10">
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Shipping Restrictions
                      </h2>
                      <p className="text-gray-600">
                        Some products may have shipping restrictions to certain
                        areas due to local regulations. If your order contains
                        such products, our customer service team will contact
                        you to discuss alternative options.
                      </p>
                    </section>

                    <section>
                      <div className="flex items-center mb-4">
                        <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                          <Shield className="h-5 w-5 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          Lost or Damaged Packages
                        </h2>
                      </div>
                      <p className="text-gray-600 mb-4">
                        If your package is lost or damaged during transit,
                        please contact our customer support team within 48 hours
                        of the estimated delivery date. We will work with the
                        courier service to locate your package or arrange for a
                        replacement to be sent to you.
                      </p>
                      <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-yellow-600 mr-3" />
                          <div>
                            <p className="text-yellow-800 font-medium">
                              For any shipping-related queries, contact us at:
                            </p>
                            <p className="text-yellow-700">
                              Email: support@powerfitness.com | Phone: +91 98765
                              43210
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
