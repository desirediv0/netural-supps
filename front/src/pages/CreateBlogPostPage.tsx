import BlogPostForm from "@/components/blog/BlogPostForm";

const CreateBlogPostPage = () => {
  return (
    <div className="container p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Blog Post</h1>
        <p className="text-muted-foreground">
          Create a new blog post to publish on your website
        </p>
      </div>

      <BlogPostForm />
    </div>
  );
};

export default CreateBlogPostPage;
