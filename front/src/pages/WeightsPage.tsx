import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { weights } from "@/api/adminService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Scale,
  Plus,
  ArrowLeft,
  Loader2,
  Trash2,
  Edit,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { ErrorDialog } from "@/components/ErrorDialog";

export default function WeightsPage() {
  const { id } = useParams();
  const location = useLocation();
  const isNewWeight = location.pathname.includes("/new");
  const isEditWeight = !!id;

  // Show appropriate content based on route
  if (isNewWeight) {
    return <WeightForm mode="create" />;
  }

  if (isEditWeight) {
    return <WeightForm mode="edit" weightId={id} />;
  }

  return <WeightsList />;
}

function WeightsList() {
  const navigate = useNavigate();
  const [weightsList, setWeightsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Error dialog state
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorDialogContent, setErrorDialogContent] = useState({
    title: "",
    description: "",
  });

  // Fetch weights
  useEffect(() => {
    const fetchWeights = async () => {
      try {
        setIsLoading(true);
        const response = await weights.getWeights();

        if (response.data.success) {
          setWeightsList(response.data.data?.weights || []);
        } else {
          setError(response.data.message || "Failed to fetch weights");
        }
      } catch (error: any) {
        console.error("Error fetching weights:", error);
        setError("Failed to load weights. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeights();
  }, []);

  // Handle weight deletion confirmation
  const confirmDeleteWeight = (weightId: string, weightName: string) => {
    handleDeleteWeight(weightId, weightName);
  };

  // Handle weight deletion
  const handleDeleteWeight = async (weightId: string, weightName: string) => {
    try {
      const response = await weights.deleteWeight(weightId);

      if (response.data.success) {
        toast.success("Weight deleted successfully");
        // Update the weights list
        setWeightsList(weightsList.filter((weight) => weight.id !== weightId));
      } else {
        // Check for specific error messages
        if (
          response.data.message?.includes("in use by product variants") ||
          response.data.message?.includes("Cannot delete weight")
        ) {
          setErrorDialogContent({
            title: "Cannot Delete Weight",
            description: `This weight (${weightName}) cannot be deleted because it is currently in use by one or more product variants.\n\nTo delete this weight, you must first remove it from all product variants that use it.`,
          });
          setIsErrorDialogOpen(true);
        } else {
          toast.error(response.data.message || "Failed to delete weight");
        }
      }
    } catch (error: any) {
      console.error("Error deleting weight:", error);

      // Check if there's a specific error message from the API
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred while deleting the weight";

      if (
        errorMessage.includes("in use by product variants") ||
        errorMessage.includes("Cannot delete weight")
      ) {
        setErrorDialogContent({
          title: "Cannot Delete Weight",
          description: `This weight (${weightName}) cannot be deleted because it is currently in use by one or more product variants.\n\nTo delete this weight, you must first remove it from all product variants that use it.`,
        });
        setIsErrorDialogOpen(true);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-10">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">
            Loading weights...
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
      {/* Error Dialog */}
      <ErrorDialog
        open={isErrorDialogOpen}
        setOpen={setIsErrorDialogOpen}
        title={errorDialogContent.title}
        description={errorDialogContent.description}
        secondaryAction={{
          label: "View Products",
          onClick: () => navigate("/products"),
        }}
      />

      {/* Header and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Weights</h1>
        <Button asChild>
          <Link to="/weights/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Weight
          </Link>
        </Button>
      </div>

      {/* Weights List */}
      {weightsList.length === 0 ? (
        <Card className="p-6 flex items-center justify-center flex-col text-center">
          <Scale className="h-12 w-12 mb-4 text-primary/40" />
          <h3 className="text-lg font-medium">No Weights Found</h3>
          <p className="text-muted-foreground mt-2">
            Create your first weight to start adding product variants
          </p>
          <Button className="mt-4" asChild>
            <Link to="/weights/new">Add Your First Weight</Link>
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Weight
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Unit
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {weightsList.map((weight) => (
                  <tr key={weight.id} className="border-b">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Scale className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{weight.value}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{weight.unit}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/weights/${weight.id}`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            confirmDeleteWeight(
                              weight.id,
                              `${weight.value} ${weight.unit}`
                            )
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

function WeightForm({
  mode,
  weightId,
}: {
  mode: "create" | "edit";
  weightId?: string;
}) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === "edit");
  const [formData, setFormData] = useState({
    value: "",
    unit: "kg",
  });
  const [error, setError] = useState<string | null>(null);

  const unitOptions = [
    { value: "kg", label: "Kilograms (kg)" },
    { value: "g", label: "Grams (g)" },
    { value: "mg", label: "Milligrams (mg)" },
    { value: "lb", label: "Pounds (lb)" },
    { value: "oz", label: "Ounces (oz)" },
  ];

  // Fetch weight details if in edit mode
  useEffect(() => {
    if (mode === "edit" && weightId) {
      const fetchWeightDetails = async () => {
        try {
          setIsFetching(true);
          const response = await weights.getWeightById(weightId);
          console.log("Weight details response:", response); // Debug logging

          if (response.data.success) {
            const weightData = response.data.data?.weight;
            setFormData({
              value: weightData?.value.toString() || "",
              unit: weightData?.unit || "kg",
            });
          } else {
            setError(response.data.message || "Failed to fetch weight details");
          }
        } catch (error: any) {
          console.error("Error fetching weight:", error);
          setError("An error occurred while fetching the weight");
        } finally {
          setIsFetching(false);
        }
      };

      fetchWeightDetails();
    }
  }, [mode, weightId]);

  // Handle form input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = {
        value: parseFloat(formData.value),
        unit: formData.unit,
      };

      // Validate numeric value
      if (isNaN(data.value)) {
        setError("Please enter a valid numeric value");
        setIsLoading(false);
        return;
      }

      let response;
      if (mode === "create") {
        response = await weights.createWeight(data);
      } else {
        response = await weights.updateWeight(weightId!, data);
      }

      if (response.data.success) {
        toast.success(
          mode === "create"
            ? "Weight created successfully"
            : "Weight updated successfully"
        );
        navigate("/weights");
      } else {
        setError(
          response.data.message ||
            `Failed to ${mode === "create" ? "create" : "update"} weight`
        );
      }
    } catch (error: any) {
      console.error(`Error ${mode}ing weight:`, error);
      setError(`An error occurred while ${mode}ing the weight`);
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
            Loading weight...
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
            <Link to="/weights">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Weights
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "Create Weight" : "Edit Weight"}
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="value" className="text-sm font-medium">
                Weight Value *
              </label>
              <Input
                id="value"
                name="value"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 50, 100, 250"
                value={formData.value}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="unit" className="text-sm font-medium">
                Unit *
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                {unitOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/weights")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Weight" : "Update Weight"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
