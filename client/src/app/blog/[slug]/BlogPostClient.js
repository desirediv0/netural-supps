"use client";

import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Calendar, Tag, Clock, BookOpen } from "lucide-react";
import { useState } from "react";

// Helper function to format image URLs correctly
const getImageUrl = (image) => {
  if (!image) return "/placeholder.svg?height=400&width=800";
  if (image.startsWith("http")) return image;
  return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
};

export default function BlogPostClient({ post, relatedPosts }) {
  const [loading] = useState(!post);
  const [postData] = useState(post);
  const [relatedPostsData] = useState(relatedPosts);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-5 w-1/2 mb-8" />
            <Skeleton className="w-full h-[400px] mb-10 rounded-lg" />
            <Skeleton className="h-6 w-1/3 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-8" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
          </div>
        </div>
      </div>
    );
  }

  if (!postData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6">
              <BookOpen className="h-8 w-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-gray-800">
              Blog Post Not Found
            </h1>
            <p className="mb-8 text-gray-600">
              The blog post you&apos;re looking for doesn&apos;t exist or has
              been removed.
            </p>
            <Link href="/blog">
              <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-3 rounded-xl font-semibold">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
      <main className="pt-12 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back to blog link */}
            <Link
              href="/blog"
              className="inline-flex items-center text-yellow-600 hover:text-yellow-700 mb-8 font-medium transition-colors group"
            >
              <ChevronLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
              Back to Blog
            </Link>

            {/* Post header */}
            <header className="mb-10 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                <div className="flex items-center text-gray-500">
                  <Calendar className="h-4 w-4 mr-2 text-yellow-500" />
                  <time dateTime={postData.createdAt}>
                    {formatDate(postData.createdAt)}
                  </time>
                </div>
                {postData.categories?.map((category) => (
                  <Link
                    key={category.id}
                    href={`/blog?category=${category.slug}`}
                    className="flex items-center bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full hover:bg-yellow-200 transition-colors"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {category.name}
                  </Link>
                ))}
                <div className="flex items-center text-gray-500">
                  <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                  <span>5 min read</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 leading-tight">
                {postData.title}
              </h1>
              {postData.summary && (
                <p className="text-xl text-gray-600 leading-relaxed">
                  {postData.summary}
                </p>
              )}
            </header>

            {/* Featured image */}
            {postData.coverImage && (
              <div className="relative w-full h-[400px] md:h-[500px] mb-10 rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={getImageUrl(postData.coverImage) || "/placeholder.svg"}
                  alt={postData.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 768px, 1024px"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            )}

            {/* Post content */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-16">
              <div
                className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-a:text-yellow-600 prose-strong:text-gray-800"
                dangerouslySetInnerHTML={{ __html: postData.content }}
              />
            </div>

            {/* Related posts */}
            {relatedPostsData.length > 0 && (
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-3xl font-bold mb-8 text-gray-800">
                  Related Posts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPostsData.map((relatedPost) => (
                    <article
                      key={relatedPost.id}
                      className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
                    >
                      <Link
                        href={`/blog/${relatedPost.slug}`}
                        className="block"
                      >
                        <div className="relative h-48 w-full">
                          <Image
                            src={
                              getImageUrl(relatedPost.coverImage) ||
                              "/placeholder.svg"
                            }
                            alt={relatedPost.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 320px"
                            className="object-cover"
                          />
                        </div>
                      </Link>
                      <div className="p-4">
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <Calendar className="h-3 w-3 mr-1 text-yellow-500" />
                          {formatDate(relatedPost.createdAt)}
                        </div>
                        <Link href={`/blog/${relatedPost.slug}`}>
                          <h3 className="font-bold hover:text-yellow-600 transition-colors line-clamp-2 mb-2 text-gray-800">
                            {relatedPost.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {relatedPost.summary}
                        </p>
                        <Link href={`/blog/${relatedPost.slug}`}>
                          <Button
                            variant="link"
                            className="px-0 text-yellow-600 text-sm font-semibold hover:text-yellow-700"
                          >
                            Read More
                          </Button>
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
