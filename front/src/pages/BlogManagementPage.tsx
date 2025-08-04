import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Edit,
  MoreHorizontal,
  Plus,
  Trash2,
  Eye,
  Search,
  Filter,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { API_URL } from "@/config/api";
import BlogCategoriesTab from "@/components/blog/BlogCategoriesTab";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  coverImage: string | null;
  coverImageUrl: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  categories: BlogCategory[];
  author: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

interface BlogPostsResponse {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalPosts: number;
  };
}

const BlogManagementPage = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const navigate = useNavigate();

  const fetchBlogPosts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<{ data: BlogPostsResponse }>(
        `${API_URL}/admin/blog?page=${page}&limit=10`
      );

      const responseData = response.data?.data;
      setBlogPosts(responseData?.posts || []);
      setTotalPages(responseData?.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      setBlogPosts([]);
      toast.error("Failed to fetch blog posts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, [page]);

  const handleCreatePost = () => {
    navigate("/blog-management/create");
  };

  const handleEditPost = (post: BlogPost) => {
    navigate(`/blog-management/edit/${post.id}`);
  };

  const handleViewPost = (post: BlogPost) => {
    window.open(`/blog/${post.slug}`, "_blank");
  };

  const confirmDelete = (post: BlogPost) => {
    setSelectedPost(post);
    setDeleteDialogOpen(true);
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;

    try {
      await axios.delete(`${API_URL}/admin/blog/${selectedPost.id}`);

      toast.success("Blog post deleted successfully.");

      // Refresh the blog posts
      fetchBlogPosts();
    } catch (error) {
      console.error("Error deleting blog post:", error);
      toast.error("Failed to delete blog post. Please try again.");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedPost(null);
    }
  };

  return (
    <div className="container p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground">
            Manage your blog posts, categories, and content
          </p>
        </div>
        <Button onClick={handleCreatePost}>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="posts">Blog Posts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Blog Posts</CardTitle>
                  <CardDescription>
                    Manage your blog posts and content
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search posts..."
                      className="pl-8 w-[200px] md:w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : !blogPosts || blogPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No blog posts found
                  </p>
                  <Button onClick={handleCreatePost}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Post
                  </Button>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead className="hidden md:table-cell">
                            Categories
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Status
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Date
                          </TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {blogPosts.map((post) => (
                          <TableRow key={post.id}>
                            <TableCell>
                              <div className="font-medium">{post.title}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-[200px] md:hidden">
                                {post.summary || post.slug}
                              </div>
                              <div className="md:hidden mt-1">
                                {post.isPublished ? (
                                  <Badge
                                    variant="default"
                                    className="bg-green-500"
                                  >
                                    Published
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">Draft</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex flex-wrap gap-1">
                                {post.categories.length > 0 ? (
                                  post.categories.map((category) => (
                                    <Badge
                                      key={category.id}
                                      variant="secondary"
                                    >
                                      {category.name}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-muted-foreground text-xs">
                                    No categories
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {post.isPublished ? (
                                <Badge
                                  variant="default"
                                  className="bg-green-500"
                                >
                                  Published
                                </Badge>
                              ) : (
                                <Badge variant="outline">Draft</Badge>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="text-sm">
                                {formatDistanceToNow(new Date(post.createdAt), {
                                  addSuffix: true,
                                })}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="data-[state=open]:bg-muted"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleEditPost(post)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleViewPost(post)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => confirmDelete(post)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              setPage((prev) => Math.max(prev - 1, 1))
                            }
                            className={
                              page <= 1 ? "pointer-events-none opacity-50" : ""
                            }
                          />
                        </PaginationItem>
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((pageNum) => (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setPage(pageNum)}
                              isActive={pageNum === page}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              setPage((prev) =>
                                prev < totalPages ? prev + 1 : prev
                              )
                            }
                            className={
                              page >= totalPages
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="pt-4">
          <BlogCategoriesTab />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete the blog post{" "}
              <span className="font-semibold">{selectedPost?.title}</span>? This
              action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePost}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogManagementPage;
