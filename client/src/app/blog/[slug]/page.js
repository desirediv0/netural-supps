import { fetchApi } from "@/lib/utils";
import BlogPostClient from "./BlogPostClient";

// Generate metadata for the page - runs on the server
export async function generateMetadata({ params }) {
  const { slug } = params;

  try {
    const response = await fetchApi(`/content/blog/${slug}`);

    const post = response.data.post;

    if (!post) {
      return {
        title: "Blog Post Not Found",
        description:
          "The blog post you're looking for doesn't exist or has been removed.",
      };
    }

    return {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.summary || post.title,
      keywords: post.keywords || post.title,
      openGraph: {
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.summary || post.content,
        images: post.coverImageUrl
          ? [post.coverImageUrl]
          : ["/images/blog-placeholder.jpg"],
        type: "article",
      },
    };
  } catch (error) {
    console.error("Failed to fetch metadata for blog post:", error);
    return {
      title: "Blog Post",
      description: "Read our latest blog post",
    };
  }
}

// This is a server component that fetches data and passes it to the client component
export default async function BlogPostPage({ params }) {
  const { slug } = params;

  try {
    const response = await fetchApi(`/content/blog/${slug}`);
    const post = response.data.post;
    const relatedPosts = response.data.relatedPosts || [];

    return (
      <BlogPostClient post={post} relatedPosts={relatedPosts} slug={slug} />
    );
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
    return <BlogPostClient post={null} relatedPosts={[]} slug={slug} />;
  }
}
