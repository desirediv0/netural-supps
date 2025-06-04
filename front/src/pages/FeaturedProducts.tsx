import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { products } from "@/api/adminService";
import { Loader2, ArrowUpRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description?: string;
  image?: string;
  images?: Array<{
    id: string;
    url: string;
    isPrimary?: boolean;
  }>;
  basePrice?: number;
  regularPrice?: number;
  price?: number;
  salePrice?: number;
  slug?: string;
  isActive?: boolean;
  featured?: boolean;
  categories?: any[];
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  variants?: any[];
  hasVariants?: boolean;
  flavors?: number;
  hasSale?: boolean;
}

export default function FeaturedProductsPage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Fetch featured products
      const featuredResponse = await products.getFeaturedProducts(50);

      // Fetch all products
      const allResponse = await products.getProducts({
        limit: 100,
        sortBy: "createdAt",
        order: "desc",
      });

      console.log("Featured products response:", featuredResponse.data);
      console.log("All products response:", allResponse.data);

      if (featuredResponse.data.success && allResponse.data.success) {
        setFeaturedProducts(featuredResponse.data.data.products || []);
        setAllProducts(allResponse.data.data.products || []);
      } else {
        setError("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("An error occurred while fetching products");
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (productId: string, featured: boolean) => {
    try {
      setUpdateLoading(productId);

      // Create form data
      const formData = new FormData();
      formData.append("featured", String(featured));

      // Update product
      const response = await products.updateProduct(productId, formData as any);

      if (response.data.success) {
        toast.success(
          `Product ${featured ? "marked as featured" : "removed from featured"}`
        );
        // Refresh product lists
        fetchProducts();
      } else {
        toast.error("Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("An error occurred while updating the product");
    } finally {
      setUpdateLoading(null);
    }
  };

  const getProductImage = (product: Product) => {
    // Handle case where image is directly available
    if (product.image) return product.image;

    // Handle case where images are in an array
    if (product.images && product.images.length > 0) {
      // Try to find primary image first
      const primaryImage = product.images.find((img) => img.isPrimary);
      if (primaryImage) return primaryImage.url;

      // If no primary image, return first image
      return product.images[0].url;
    }

    // No image available
    return undefined;
  };

  const getProductPrice = (product: Product) => {
    // For products with explicit basePrice/regularPrice (featured products format)
    if (product.basePrice !== undefined) return product.basePrice;

    // For products with direct price/salePrice
    if (product.salePrice)
      return typeof product.salePrice === "string"
        ? parseFloat(product.salePrice)
        : product.salePrice;
    if (product.price)
      return typeof product.price === "string"
        ? parseFloat(product.price)
        : product.price;

    // For products with variants, calculate minimum price
    if (product.variants && product.variants.length > 0) {
      const prices = product.variants.map((variant) => {
        if (variant.salePrice)
          return typeof variant.salePrice === "string"
            ? parseFloat(variant.salePrice)
            : variant.salePrice;
        return typeof variant.price === "string"
          ? parseFloat(variant.price)
          : variant.price;
      });
      return Math.min(...prices);
    }

    return 0;
  };

  const getCategoryName = (product: Product) => {
    if (product.category) return product.category.name;
    if (product.categories && product.categories.length > 0)
      return product.categories[0].name;
    return "Uncategorized";
  };

  const getVariantCount = (product: Product) => {
    // If flavors count is explicitly provided
    if (product.flavors !== undefined) return product.flavors;

    // Count variants directly from the array
    if (product.variants && product.variants.length > 0) {
      return product.variants.length;
    }

    // Default case
    return 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md p-8 border border-red-200 bg-red-50 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Featured Products
          </h2>
          <p className="text-muted-foreground">
            Manage products that are highlighted on the homepage
          </p>
        </div>
        <Link to="/products/new">
          <Button className="mt-4 md:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Featured Products */}
      <Card>
        <CardHeader>
          <CardTitle>Currently Featured Products</CardTitle>
        </CardHeader>
        <CardContent>
          {featuredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No featured products found. Use the toggle below to feature
              products.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featuredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {getProductImage(product) ? (
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                            <span className="text-xs text-gray-500">
                              No img
                            </span>
                          </div>
                        )}
                        <span className="max-w-[200px] truncate">
                          {product.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryName(product)}</TableCell>
                    <TableCell>₹{getProductPrice(product)}</TableCell>
                    <TableCell>
                      {getVariantCount(product) > 0 ? (
                        <Badge variant="outline">
                          {getVariantCount(product)} variants
                        </Badge>
                      ) : (
                        <span>
                          {product.hasVariants ? "Multiple" : "Simple"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.isActive !== false ? (
                        <Badge variant="default" className="bg-green-500">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={!!product.featured}
                        disabled={updateLoading === product.id}
                        onCheckedChange={(checked) =>
                          toggleFeatured(product.id, checked)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/products/${product.id}`}>
                        <Button variant="ghost" size="sm">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* All Products */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <p className="text-muted-foreground">
            Toggle products to feature them on the homepage
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allProducts
                .filter((p) => !featuredProducts.some((fp) => fp.id === p.id))
                .map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {getProductImage(product) ? (
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                            <span className="text-xs text-gray-500">
                              No img
                            </span>
                          </div>
                        )}
                        <span className="max-w-[200px] truncate">
                          {product.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryName(product)}</TableCell>
                    <TableCell>₹{getProductPrice(product)}</TableCell>
                    <TableCell>
                      {getVariantCount(product) > 0 ? (
                        <Badge variant="outline">
                          {getVariantCount(product)} variants
                        </Badge>
                      ) : (
                        <span>
                          {product.hasVariants ? "Multiple" : "Simple"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.isActive !== false ? (
                        <Badge variant="default" className="bg-green-500">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={!!product.featured}
                        disabled={updateLoading === product.id}
                        onCheckedChange={(checked) =>
                          toggleFeatured(product.id, checked)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/products/${product.id}`}>
                        <Button variant="ghost" size="sm">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
