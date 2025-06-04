import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Resource, Action } from "@/types/admin";

// Import the ProductForm component from ProductsPage
import { ProductForm } from "./ProductsPage";

export default function ProductCreatePage() {
  const { admin } = useAuth();

  const hasPermission =
    admin?.role === "SUPER_ADMIN" ||
    admin?.permissions?.includes(`${Resource.PRODUCTS}:${Action.CREATE}`);

  if (!hasPermission) {
    return (
      <div className="space-y-6">
        <Card className="bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <p className="text-amber-800">
                You don't have permission to create products. Please contact
                your administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProductForm mode="create" />
    </div>
  );
}
