import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { coupons } from "@/api/adminService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Ticket,
  Plus,
  ArrowLeft,
  Loader2,
  Trash2,
  Edit,
  AlertTriangle,
  PercentIcon,
  Calendar,
  CheckCircle,
  XCircle,
  IndianRupee,
} from "lucide-react";
import { toast } from "sonner";

export default function CouponsPage() {
  const { id } = useParams();
  const location = useLocation();
  const isNewCoupon = location.pathname.includes("/new");
  const isEditCoupon = !!id;

  // Use lazy loading for the components to reduce initial load time
  return (
    <>
      {isNewCoupon && <CouponForm mode="create" />}
      {isEditCoupon && <CouponForm mode="edit" couponId={id} />}
      {!isNewCoupon && !isEditCoupon && <CouponsList />}
    </>
  );
}

function CouponsList() {
  const [couponsList, setCouponsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setIsLoading(true);
        const response = await coupons.getCoupons();

        if (response.data.success) {
          setCouponsList(response.data.data?.coupons || []);
        } else {
          setError(response.data.message || "Failed to fetch coupons");
        }
      } catch (error: any) {
        console.error("Error fetching coupons:", error);
        setError("Failed to load coupons. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  // Handle coupon deletion
  const handleDeleteCoupon = async (couponId: string, couponCode: string) => {
    if (
      !window.confirm(`Are you sure you want to delete coupon "${couponCode}"?`)
    ) {
      return;
    }

    try {
      const response = await coupons.deleteCoupon(couponId);
      if (response.data.success) {
        toast.success("Coupon deleted successfully");
        // Update the coupons list
        setCouponsList(couponsList.filter((coupon) => coupon.id !== couponId));
      } else {
        toast.error(response.data.message || "Failed to delete coupon");
      }
    } catch (error: any) {
      console.error("Error deleting coupon:", error);
      toast.error("An error occurred while deleting the coupon");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-10">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">
            Loading coupons...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center py-10">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold">Something went wrong</h2>
        <p className="text-center text-muted-foreground">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <Button asChild>
          <Link to="/coupons/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Coupon
          </Link>
        </Button>
      </div>

      {/* Coupons List */}
      {couponsList.length === 0 ? (
        <Card className="p-6 flex items-center justify-center flex-col text-center">
          <Ticket className="h-12 w-12 mb-4 text-primary/40" />
          <h3 className="text-lg font-medium">No Coupons Found</h3>
          <p className="text-muted-foreground mt-2">
            Create your first discount coupon to offer to customers
          </p>
          <Button className="mt-4" asChild>
            <Link to="/coupons/new">Add Your First Coupon</Link>
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Discount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Valid Period
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {couponsList.map((coupon) => (
                  <tr key={coupon.id} className="border-b">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{coupon.code}</span>
                        {coupon.description && (
                          <span className="text-xs text-muted-foreground">
                            {coupon.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {coupon.discountType === "PERCENTAGE" ? (
                          <>
                            <PercentIcon className="h-4 w-4 text-muted-foreground" />
                            <span>{coupon.discountValue}% off</span>
                          </>
                        ) : (
                          <>
                            <IndianRupee className="h-4 w-4 text-muted-foreground" />
                            <span>₹{coupon.discountValue} off</span>
                          </>
                        )}
                      </div>
                      {coupon.minOrderAmount && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Min. order: ₹{coupon.minOrderAmount}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {formatDate(coupon.startDate)}
                          {coupon.endDate && ` - ${formatDate(coupon.endDate)}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {coupon.isActive ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <XCircle className="h-4 w-4" />
                          <span>Inactive</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/coupons/${coupon.id}`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            handleDeleteCoupon(coupon.id, coupon.code)
                          }
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function CouponForm({
  mode,
  couponId,
}: {
  mode: "create" | "edit";
  couponId?: string;
}) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === "edit");
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderAmount: "",
    maxUses: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch coupon details if in edit mode
  useEffect(() => {
    if (mode === "edit" && couponId) {
      const fetchCouponDetails = async () => {
        try {
          setIsFetching(true);
          const response = await coupons.getCouponById(couponId);
          console.log("Coupon details response:", response); // Debug logging

          if (response.data.success) {
            const couponData = response.data.data?.coupon;
            setFormData({
              code: couponData?.code.toUpperCase() || "",
              description: couponData?.description || "",
              discountType: couponData?.discountType || "PERCENTAGE",
              discountValue: couponData?.discountValue?.toString() || "",
              minOrderAmount: couponData?.minOrderAmount?.toString() || "",
              maxUses: couponData?.maxUses?.toString() || "",
              startDate: couponData?.startDate
                ? new Date(couponData.startDate).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
              endDate: couponData?.endDate
                ? new Date(couponData.endDate).toISOString().split("T")[0]
                : "",
              isActive: couponData?.isActive ?? true,
            });
          } else {
            setError(response.data.message || "Failed to fetch coupon details");
          }
        } catch (error: any) {
          console.error("Error fetching coupon:", error);
          setError("An error occurred while fetching the coupon");
        } finally {
          setIsFetching(false);
        }
      };

      fetchCouponDetails();
    }
  }, [mode, couponId]);

  // Handle form input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    // Special handling for coupon code - convert to uppercase immediately
    if (name === "code") {
      setFormData((prev) => ({
        ...prev,
        [name]: value.toUpperCase(),
      }));
    } else {
      // Normal handling for other fields
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }));
    }

    // Clear error when user changes input
    if (error) {
      setError(null);
    }
  };

  // Validate form before submission
  const validateForm = () => {
    // Check if code is empty
    if (!formData.code.trim()) {
      setError("Coupon code is required");
      return false;
    }

    // Check if code contains only valid characters
    if (!/^[A-Z0-9_-]+$/i.test(formData.code)) {
      setError(
        "Coupon code can only contain letters, numbers, underscores, and hyphens"
      );
      return false;
    }

    // Make sure discount value is a valid number and greater than 0
    const discountValue = parseFloat(formData.discountValue);
    if (isNaN(discountValue) || discountValue <= 0) {
      setError("Discount value must be a positive number");
      return false;
    }

    // Validate discount value based on discount type
    if (formData.discountType === "PERCENTAGE" && discountValue > 100) {
      setError("Percentage discount cannot be greater than 100%");
      return false;
    }

    // If minimum order amount is provided, make sure it's a valid number
    if (
      formData.minOrderAmount &&
      (isNaN(parseFloat(formData.minOrderAmount)) ||
        parseFloat(formData.minOrderAmount) < 0)
    ) {
      setError("Minimum order amount must be a positive number");
      return false;
    }

    // If max uses is provided, make sure it's a valid positive integer
    if (
      formData.maxUses &&
      (isNaN(parseInt(formData.maxUses)) || parseInt(formData.maxUses) < 1)
    ) {
      setError("Maximum uses must be a positive integer");
      return false;
    }

    // Make sure end date is after start date if provided
    if (
      formData.endDate &&
      new Date(formData.endDate) <= new Date(formData.startDate)
    ) {
      setError("End date must be after start date");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = {
        ...formData,
        // Make sure code is uppercase when submitting to backend
        code: formData.code.toUpperCase(),
        discountType: formData.discountType as "PERCENTAGE" | "FIXED_AMOUNT",
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: formData.minOrderAmount
          ? parseFloat(formData.minOrderAmount)
          : undefined,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
      };

      let response;
      if (mode === "create") {
        response = await coupons.createCoupon(data);
      } else {
        response = await coupons.updateCoupon(couponId!, data);
      }

      if (response.data.success) {
        toast.success(
          mode === "create"
            ? "Coupon created successfully"
            : "Coupon updated successfully"
        );
        navigate("/coupons");
      } else {
        // Display the exact error message from the API
        const errorMsg = response.data.message || `Failed to ${mode} coupon`;
        setError(errorMsg);

        // Use toast.error with longer duration for visibility
        toast.error(errorMsg, {
          duration: 5000,
          position: "top-center",
        });
      }
    } catch (error: any) {
      console.error(`Error ${mode}ing coupon:`, error);

      // Extract error message from the API response if available
      const errorMessage =
        error.response?.data?.message ||
        `An error occurred while ${mode === "create" ? "creating" : "updating"} the coupon`;

      setError(errorMessage);

      // Show detailed toast with longer duration
      toast.error(errorMessage, {
        duration: 5000,
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state during fetch
  if (isFetching) {
    return (
      <div className="flex h-full w-full items-center justify-center py-10">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">
            Loading coupon...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/coupons">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Coupons
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "Create Coupon" : "Edit Coupon"}
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 mb-4 rounded-md flex items-center gap-2 border border-destructive/20">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">{error}</p>
            {error.includes("code already exists") && (
              <p className="text-xs mt-1">
                Please choose a different coupon code or edit the existing one.
              </p>
            )}
          </div>
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="code" className="text-sm font-medium">
                Coupon Code *
              </label>
              <Input
                id="code"
                name="code"
                placeholder="e.g., SUMMER2023, WELCOME10"
                value={formData.code}
                onChange={handleInputChange}
                required
                className={
                  error &&
                    (error.includes("code already exists") ||
                      error.includes("Coupon code"))
                    ? "border-destructive ring-1 ring-destructive"
                    : ""
                }
              />
              {error &&
                (error.includes("code already exists") ||
                  error.includes("Coupon code")) && (
                  <p className="text-xs text-destructive mt-1">
                    {error.includes("code already exists")
                      ? "This coupon code is already in use. Please choose a different code."
                      : error}
                  </p>
                )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="description"
                name="description"
                placeholder="Short description of the coupon"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="discountType" className="text-sm font-medium">
                Discount Type *
              </label>
              <select
                id="discountType"
                name="discountType"
                value={formData.discountType}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="PERCENTAGE">Percentage Discount (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount Discount (₹)</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="discountValue" className="text-sm font-medium">
                Discount Value *
              </label>
              <div className="flex">
                <div className="flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3">
                  {formData.discountType === "PERCENTAGE" ? (
                    <PercentIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <Input
                  id="discountValue"
                  name="discountValue"
                  type="number"
                  min="0"
                  step={formData.discountType === "PERCENTAGE" ? "1" : "0.01"}
                  placeholder={
                    formData.discountType === "PERCENTAGE" ? "10" : "100"
                  }
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  className={
                    error && error.includes("Discount value")
                      ? "border-destructive ring-1 ring-destructive rounded-l-none"
                      : "rounded-l-none"
                  }
                  required
                />
              </div>
              {error && error.includes("Discount value") && (
                <p className="text-xs text-destructive mt-1">{error}</p>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="minOrderAmount" className="text-sm font-medium">
                Minimum Order Amount
              </label>
              <div className="flex">
                <div className="flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3">
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="minOrderAmount"
                  name="minOrderAmount"
                  type="number"
                  min="0"

                  placeholder="500"
                  value={formData.minOrderAmount}
                  onChange={handleInputChange}
                  className="rounded-l-none"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="maxUses" className="text-sm font-medium">
                Maximum Uses
              </label>
              <Input
                id="maxUses"
                name="maxUses"
                type="number"
                min="0"
                step="1"
                placeholder="Leave empty for unlimited"
                value={formData.maxUses}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="startDate" className="text-sm font-medium">
                Start Date *
              </label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="endDate" className="text-sm font-medium">
                End Date
              </label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                min={formData.startDate}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={formData.isActive as boolean}
                onChange={handleInputChange}
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/coupons")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Coupon" : "Update Coupon"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
