import { ReactNode, useState } from "react";
import { Link, useLocation, Navigate, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Resource, Action } from "@/types/admin";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tags,
  LogOut,
  Menu,
  X,
  Coffee,
  Scale,
  Ticket,
  FileText,
  Mail,
  Star,
  MessageSquare,
  HelpCircle,
  BarChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SafeRender } from "@/components/SafeRender";
import InventoryAlertNotification from "@/components/ui/InventoryAlertNotification";

interface NavItemProps {
  href: string;
  icon: ReactNode;
  title: string;
  onClick?: () => void;
  hasPermission: boolean;
}

const NavItem = ({
  href,
  icon,
  title,
  onClick,
  hasPermission = true,
}: NavItemProps) => {
  const location = useLocation();
  const isActive =
    location.pathname === href || location.pathname.startsWith(`${href}/`);

  if (!hasPermission) return null;

  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-foreground",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
      )}
    >
      <span className="flex shrink-0 items-center justify-center">{icon}</span>
      <span className="text-sm font-medium">{title}</span>
    </Link>
  );
};

const hasPermissionFor = (
  admin: any,
  resource: Resource,
  action?: Action
): boolean => {
  if (admin?.role === "SUPER_ADMIN") return true;

  if (!admin?.permissions || !Array.isArray(admin.permissions)) return false;

  const resourcePrefix = `${resource}:`;

  if (action) {
    const permissionString = `${resource}:${action}`;
    return admin.permissions.some((perm: string) => perm === permissionString);
  } else {
    return admin.permissions.some((perm: string) =>
      perm.startsWith(resourcePrefix)
    );
  }
};

export default function DashboardLayout() {
  const { admin, isAuthenticated, logout, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar - Desktop */}
      <aside className="bg-sidebar hidden w-64 flex-col border-r border-sidebar-border md:flex">
        <div className="flex h-14 items-center border-b border-sidebar-border px-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 font-semibold text-sidebar-foreground"
          >
            <Package className="h-6 w-6" />
            <span>Admin Dashboard</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <SafeRender>
            <div className="flex flex-col gap-1">
              <NavItem
                href="/dashboard"
                icon={<LayoutDashboard className="h-5 w-5" />}
                title="Dashboard"
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.DASHBOARD,
                  Action.READ
                )}
              />
              <NavItem
                href="/dashboard/analytics"
                icon={<BarChart className="h-5 w-5" />}
                title="Analytics"
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.ANALYTICS,
                  Action.READ
                )}
              />
              <NavItem
                href="/products"
                icon={<Package className="h-5 w-5" />}
                title="Products"
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.PRODUCTS,
                  Action.READ
                )}
              />
              <NavItem
                href="/featured-products"
                icon={<Star className="h-5 w-5" />}
                title="Featured"
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.PRODUCTS,
                  Action.UPDATE
                )}
              />
              <NavItem
                href="/flavors"
                icon={<Coffee className="h-5 w-5" />}
                title="Flavors"
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.FLAVORS,
                  Action.READ
                )}
              />
              <NavItem
                href="/weights"
                icon={<Scale className="h-5 w-5" />}
                title="Weights"
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.WEIGHTS,
                  Action.READ
                )}
              />
              <NavItem
                href="/orders"
                icon={<ShoppingCart className="h-5 w-5" />}
                title="Orders"
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.ORDERS,
                  Action.READ
                )}
              />
              <NavItem
                href="/categories"
                icon={<Tags className="h-5 w-5" />}
                title="Categories"
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.CATEGORIES,
                  Action.READ
                )}
              />
              <NavItem
                href="/coupons"
                icon={<Ticket className="h-5 w-5" />}
                title="Coupons"
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.COUPONS,
                  Action.READ
                )}
              />
              <NavItem
                href="/blog-management"
                icon={<FileText className="h-5 w-5" />}
                title="Blog"
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.CONTENT,
                  Action.READ
                )}
              />
              <NavItem
                href="/contact-management"
                icon={<Mail className="h-5 w-5" />}
                title="Contact"
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.CONTACT,
                  Action.READ
                )}
              />
              <NavItem
                href="/reviews-management"
                icon={<MessageSquare className="h-5 w-5" />}
                title="Reviews"
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.REVIEWS,
                  Action.READ
                )}
              />
              <NavItem
                href="/faq-management"
                icon={<HelpCircle className="h-5 w-5" />}
                title="FAQ"
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.FAQS,
                  Action.READ
                )}
              />
              <NavItem
                href="/users"
                icon={<Users className="h-5 w-5" />}
                title="Users"
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.USERS,
                  Action.READ
                )}
              />
              <NavItem
                href="/admins"
                icon={<Users className="h-5 w-5" />}
                title="Admins"
                hasPermission={admin?.role === "SUPER_ADMIN"}
              />
            </div>
          </SafeRender>
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
              {admin?.firstName?.charAt(0) || admin?.email?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground">
                {admin?.firstName
                  ? `${admin.firstName} ${admin.lastName}`
                  : admin?.email}
              </span>
              <span className="text-xs text-sidebar-foreground/60">
                {admin?.role}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start border-sidebar-border hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </Button>
        </div>
      </aside>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar transition-transform duration-200 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 font-semibold text-sidebar-foreground"
          >
            <Package className="h-6 w-6" />
            <span>Admin Dashboard</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <SafeRender>
            <div className="flex flex-col gap-1">
              <NavItem
                href="/dashboard"
                icon={<LayoutDashboard className="h-5 w-5" />}
                title="Dashboard"
                onClick={toggleMobileMenu}
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.DASHBOARD,
                  Action.READ
                )}
              />
              <NavItem
                href="/products"
                icon={<Package className="h-5 w-5" />}
                title="Products"
                onClick={toggleMobileMenu}
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.PRODUCTS,
                  Action.READ
                )}
              />
              <NavItem
                href="/featured-products"
                icon={<Star className="h-5 w-5" />}
                title="Featured"
                onClick={toggleMobileMenu}
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.PRODUCTS,
                  Action.UPDATE
                )}
              />
              <NavItem
                href="/flavors"
                icon={<Coffee className="h-5 w-5" />}
                title="Flavors"
                onClick={toggleMobileMenu}
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.FLAVORS,
                  Action.READ
                )}
              />
              <NavItem
                href="/weights"
                icon={<Scale className="h-5 w-5" />}
                title="Weights"
                onClick={toggleMobileMenu}
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.WEIGHTS,
                  Action.READ
                )}
              />
              <NavItem
                href="/orders"
                icon={<ShoppingCart className="h-5 w-5" />}
                title="Orders"
                onClick={toggleMobileMenu}
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.ORDERS,
                  Action.READ
                )}
              />
              <NavItem
                href="/categories"
                icon={<Tags className="h-5 w-5" />}
                title="Categories"
                onClick={toggleMobileMenu}
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.CATEGORIES,
                  Action.READ
                )}
              />
              <NavItem
                href="/coupons"
                icon={<Ticket className="h-5 w-5" />}
                title="Coupons"
                onClick={toggleMobileMenu}
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.COUPONS,
                  Action.READ
                )}
              />
              <NavItem
                href="/blog-management"
                icon={<FileText className="h-5 w-5" />}
                title="Blog"
                onClick={toggleMobileMenu}
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.CONTENT,
                  Action.READ
                )}
              />
              <NavItem
                href="/contact-management"
                icon={<Mail className="h-5 w-5" />}
                title="Contact"
                onClick={toggleMobileMenu}
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.CONTACT,
                  Action.READ
                )}
              />
              <NavItem
                href="/reviews-management"
                icon={<MessageSquare className="h-5 w-5" />}
                title="Reviews"
                onClick={toggleMobileMenu}
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.REVIEWS,
                  Action.READ
                )}
              />
              <NavItem
                href="/faq-management"
                icon={<HelpCircle className="h-5 w-5" />}
                title="FAQ"
                onClick={toggleMobileMenu}
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.FAQS,
                  Action.READ
                )}
              />
              <NavItem
                href="/admins"
                icon={<Users className="h-5 w-5" />}
                title="Admins"
                onClick={toggleMobileMenu}
                hasPermission={admin?.role === "SUPER_ADMIN"}
              />
              <NavItem
                href="/users"
                icon={<Users className="h-5 w-5" />}
                title="Users"
                onClick={toggleMobileMenu}
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.USERS,
                  Action.READ
                )}
              />
              <NavItem
                href="/dashboard/analytics"
                icon={<BarChart className="h-5 w-5" />}
                title="Analytics"
                onClick={toggleMobileMenu}
                hasPermission={hasPermissionFor(
                  admin,
                  Resource.ANALYTICS,
                  Action.READ
                )}
              />
            </div>
          </SafeRender>
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
              {admin?.firstName?.charAt(0) || admin?.email?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground">
                {admin?.firstName
                  ? `${admin.firstName} ${admin.lastName}`
                  : admin?.email}
              </span>
              <span className="text-xs text-sidebar-foreground/60">
                {admin?.role}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start border-sidebar-border"
            onClick={() => {
              toggleMobileMenu();
              logout();
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex w-full flex-col">
        {/* Topbar */}
        <header className="flex h-14 items-center justify-between border-b border-border px-4 lg:px-6">
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Inventory Alerts - Desktop */}
          <div className="hidden md:block flex-1 max-w-md">
            <SafeRender>
              <InventoryAlertNotification />
            </SafeRender>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <span className="hidden text-sm md:inline-block">
              {admin?.firstName
                ? `${admin.firstName} ${admin.lastName}`
                : admin?.email}
            </span>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Mobile Alert Bar */}
        <div className="md:hidden">
          <SafeRender>
            <InventoryAlertNotification />
          </SafeRender>
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
