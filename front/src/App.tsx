import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import CategoriesPage from "./pages/CategoriesPage";
import FlavorsPage from "./pages/FlavorsPage";
import WeightsPage from "./pages/WeightsPage";
import CouponsPage from "./pages/CouponsPage";
import AdminsPage from "./pages/AdminsPage";
import AdminCreatePage from "./pages/AdminCreatePage";
import AdminPermissionsPage from "./pages/AdminPermissionsPage";
import BlogManagementPage from "./pages/BlogManagementPage";
import CreateBlogPostPage from "./pages/CreateBlogPostPage";
import EditBlogPostPage from "./pages/EditBlogPostPage";
import ContactManagementPage from "./pages/ContactManagementPage";
import ReviewsManagementPage from "./pages/ReviewsManagementPage";
import FAQManagementPage from "./pages/FAQManagementPage";
import FAQCreatePage from "./pages/FAQCreatePage";
import NotFoundPage from "./pages/NotFoundPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductCreatePage from "./pages/ProductCreatePage";
import FeaturedProductsPage from "./pages/FeaturedProducts";
import { useAuth } from "./context/AuthContext";
import { Resource, Action } from "./types/admin";
import { PermissionGuard } from "./components/PermissionGuard";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "./components/ui/card";
import UserManagementPage from "./pages/UserManagementPage";
import AnalyticsDashboard from "@/pages/AnalyticsDashboard";

// Protected Route Component
const ProtectedRoute = ({
  children,
  resource,
  action = Action.READ,
  superAdminOnly = false,
}: {
  children: React.ReactNode;
  resource?: Resource;
  action?: Action;
  superAdminOnly?: boolean;
}) => {
  const { admin, isAuthenticated } = useAuth();

  // Not authenticated at all
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Super admin only route
  if (superAdminOnly && admin?.role !== "SUPER_ADMIN") {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-10 w-10 text-red-600" />
            <div>
              <h3 className="text-lg font-medium text-red-800">
                Access Denied
              </h3>
              <p className="text-red-700">
                This page is only accessible to Super Administrators.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Permission-based route
  if (resource && action) {
    const hasPermission =
      admin?.role === "SUPER_ADMIN" ||
      admin?.permissions?.includes(`${resource}:${action}`);

    if (!hasPermission) {
      return (
        <PermissionGuard resource={resource} action={action}>
          {children}
        </PermissionGuard>
      );
    }
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={<LoginPage />}
          errorElement={<ErrorBoundary />}
        />

        {/* Authenticated routes with DashboardLayout */}
        <Route
          path="/"
          element={<DashboardLayout />}
          errorElement={<ErrorBoundary />}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route
            path="dashboard"
            element={
              <ProtectedRoute
                resource={Resource.DASHBOARD}
                action={Action.READ}
              >
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="dashboard/analytics"
            element={
              <ProtectedRoute
                resource={Resource.ANALYTICS}
                action={Action.READ}
              >
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="products"
            element={
              <ProtectedRoute resource={Resource.PRODUCTS} action={Action.READ}>
                <ProductsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="products/new"
            element={
              <ProtectedRoute
                resource={Resource.PRODUCTS}
                action={Action.CREATE}
              >
                <ProductCreatePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="products/edit/:id"
            element={
              <ProtectedRoute
                resource={Resource.PRODUCTS}
                action={Action.UPDATE}
              >
                <ProductsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="products/:id"
            element={
              <ProtectedRoute resource={Resource.PRODUCTS} action={Action.READ}>
                <ProductDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="orders"
            element={
              <ProtectedRoute resource={Resource.ORDERS} action={Action.READ}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="orders/:id"
            element={
              <ProtectedRoute resource={Resource.ORDERS} action={Action.READ}>
                <OrderDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="categories"
            element={
              <ProtectedRoute
                resource={Resource.CATEGORIES}
                action={Action.READ}
              >
                <CategoriesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="categories/new"
            element={
              <ProtectedRoute
                resource={Resource.CATEGORIES}
                action={Action.CREATE}
              >
                <CategoriesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="categories/:id"
            element={
              <ProtectedRoute
                resource={Resource.CATEGORIES}
                action={Action.UPDATE}
              >
                <CategoriesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="flavors"
            element={
              <ProtectedRoute resource={Resource.FLAVORS} action={Action.READ}>
                <FlavorsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="flavors/new"
            element={
              <ProtectedRoute
                resource={Resource.FLAVORS}
                action={Action.CREATE}
              >
                <FlavorsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="flavors/:id"
            element={
              <ProtectedRoute
                resource={Resource.FLAVORS}
                action={Action.UPDATE}
              >
                <FlavorsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="weights"
            element={
              <ProtectedRoute resource={Resource.WEIGHTS} action={Action.READ}>
                <WeightsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="weights/new"
            element={
              <ProtectedRoute
                resource={Resource.WEIGHTS}
                action={Action.CREATE}
              >
                <WeightsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="weights/:id"
            element={
              <ProtectedRoute
                resource={Resource.WEIGHTS}
                action={Action.UPDATE}
              >
                <WeightsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="coupons"
            element={
              <ProtectedRoute resource={Resource.COUPONS} action={Action.READ}>
                <CouponsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="coupons/new"
            element={
              <ProtectedRoute
                resource={Resource.COUPONS}
                action={Action.CREATE}
              >
                <CouponsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="coupons/:id"
            element={
              <ProtectedRoute
                resource={Resource.COUPONS}
                action={Action.UPDATE}
              >
                <CouponsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="admins"
            element={
              <ProtectedRoute superAdminOnly={true}>
                <AdminsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="admins/new"
            element={
              <ProtectedRoute superAdminOnly={true}>
                <AdminCreatePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="admins/permissions/:adminId"
            element={
              <ProtectedRoute superAdminOnly={true}>
                <AdminPermissionsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="users"
            element={
              <ProtectedRoute resource={Resource.USERS} action={Action.READ}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="blog-management"
            element={
              <ProtectedRoute resource={Resource.CONTENT} action={Action.READ}>
                <BlogManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="blog-management/create"
            element={
              <ProtectedRoute
                resource={Resource.CONTENT}
                action={Action.CREATE}
              >
                <CreateBlogPostPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="blog-management/edit/:id"
            element={
              <ProtectedRoute
                resource={Resource.CONTENT}
                action={Action.UPDATE}
              >
                <EditBlogPostPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="contact-management"
            element={
              <ProtectedRoute resource={Resource.CONTACT} action={Action.READ}>
                <ContactManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="reviews-management"
            element={
              <ProtectedRoute resource={Resource.REVIEWS} action={Action.READ}>
                <ReviewsManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="featured-products"
            element={
              <ProtectedRoute
                resource={Resource.PRODUCTS}
                action={Action.UPDATE}
              >
                <FeaturedProductsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="faq-management"
            element={
              <ProtectedRoute resource={Resource.FAQS} action={Action.READ}>
                <FAQManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="faq-management/create"
            element={
              <ProtectedRoute resource={Resource.FAQS} action={Action.CREATE}>
                <FAQCreatePage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>

      <Toaster position="bottom-right" richColors />
    </AuthProvider>
  );
};

export default App;
