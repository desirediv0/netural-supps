import { fetchApi } from "@/lib/utils";
import ProductContent from "./ProductContent";

export async function generateMetadata({ params }) {
  const { slug } = params;
  let title = "Product Details | GenuineNutrition";
  let description =
    "Premium quality fitness supplements with lab-tested ingredients for maximum effectiveness. Free shipping on orders over ₹999.";
  let image = null;

  try {
    // Fetch product details from API
    const response = await fetchApi(`/public/products/${slug}`);
    const product = response.data.product;

    if (product) {
      title = product.metaTitle || `${product.name} | GenuineNutrition`;
      description =
        product.metaDescription || product.description || description;

      // Get the first image from product images
      if (product.images && product.images.length > 0) {
        image = product.images[0].url;
      }
    }
  } catch (error) {
    console.error("Error fetching product metadata:", error);
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : [],
      type: "website",
    },
  };
}

export default function ProductDetailPage({ params }) {
  return <ProductContent slug={params.slug} />;
}
