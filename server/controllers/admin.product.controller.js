import { ApiError } from "../utils/ApiError.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../config/db.js";
import { deleteFromS3, getFileUrl } from "../utils/deleteFromS3.js";
import { processAndUploadImage } from "../middlewares/multer.middlerware.js";
import { createSlug } from "../helper/Slug.js";
import { generateSKU, generateVariantSKUs } from "../utils/generateSKU.js";

// Get all products with pagination, filtering, and sorting
export const getProducts = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    category = "",
    sort = "createdAt",
    order = "desc",
    featured,
    isActive,
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build filter conditions
  const filterConditions = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(category && {
      categories: {
        some: {
          category: {
            OR: [{ id: category }, { slug: category }],
          },
        },
      },
    }),
    ...(featured !== undefined && { featured: featured === "true" }),
    ...(isActive !== undefined && { isActive: isActive === "true" }),
  };

  // Get total count for pagination
  const totalProducts = await prisma.product.count({
    where: filterConditions,
  });

  // Get products with sorting
  const products = await prisma.product.findMany({
    where: filterConditions,
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      images: true,
      variants: {
        include: {
          flavor: true,
          weight: true,
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
    orderBy: {
      [sort]: order,
    },
    skip,
    take: parseInt(limit),
  });

  // Format the response data
  const formattedProducts = products.map((product) => {
    // Add image URLs and clean up the data
    return {
      ...product,
      // Extract categories into a more usable format
      categories: product.categories.map((pc) => ({
        id: pc.category.id,
        name: pc.category.name,
        description: pc.category.description,
        image: pc.category.image ? getFileUrl(pc.category.image) : null,
        slug: pc.category.slug,
        isPrimary: pc.isPrimary,
      })),
      primaryCategory:
        product.categories.find((pc) => pc.isPrimary)?.category ||
        (product.categories.length > 0 ? product.categories[0].category : null),
      images: product.images.map((image) => ({
        ...image,
        url: getFileUrl(image.url),
      })),
      variants: product.variants.map((variant) => ({
        ...variant,
        flavor: variant.flavor
          ? {
              ...variant.flavor,
              image: variant.flavor.image
                ? getFileUrl(variant.flavor.image)
                : null,
            }
          : null,
      })),
    };
  });

  res.status(200).json(
    new ApiResponsive(
      200,
      {
        products: formattedProducts,
        pagination: {
          total: totalProducts,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalProducts / parseInt(limit)),
        },
      },
      "Products fetched successfully"
    )
  );
});

// Get product details by ID
export const getProductById = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      images: true,
      variants: {
        include: {
          flavor: true,
          weight: true,
        },
      },
      reviews: {
        where: { status: "APPROVED" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Format the response data
  const formattedProduct = {
    ...product,
    // Extract categories into a more usable format
    categories: product.categories.map((pc) => ({
      id: pc.category.id,
      name: pc.category.name,
      description: pc.category.description,
      image: pc.category.image ? getFileUrl(pc.category.image) : null,
      slug: pc.category.slug,
      isPrimary: pc.isPrimary,
    })),
    primaryCategory:
      product.categories.find((pc) => pc.isPrimary)?.category ||
      (product.categories.length > 0 ? product.categories[0].category : null),
    images: product.images.map((image) => ({
      ...image,
      url: getFileUrl(image.url),
    })),
    variants: product.variants.map((variant) => ({
      ...variant,
      flavor: variant.flavor
        ? {
            ...variant.flavor,
            image: variant.flavor.image
              ? getFileUrl(variant.flavor.image)
              : null,
          }
        : null,
    })),
    // Include SEO fields
    metaTitle: product.metaTitle || product.name,
    metaDescription: product.metaDescription || product.description,
    keywords: product.keywords || "",
  };

  res
    .status(200)
    .json(
      new ApiResponsive(
        200,
        { product: formattedProduct },
        "Product fetched successfully"
      )
    );
});

// Create a new product
export const createProduct = asyncHandler(async (req, res, next) => {
  // Check if body is completely empty
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ApiError(400, "Product data is missing. Empty request received.");
  }

  const {
    name,
    description,
    categoryIds,
    primaryCategoryId,
    isSupplement,
    ingredients,
    nutritionInfo,
    featured,
    isActive,
    hasVariants,
    variants: variantsJson,
    metaTitle,
    metaDescription,
    keywords,
  } = req.body;

  // Validation checks with better error handling
  if (
    !name ||
    name.trim() === "" ||
    name.includes('{"success":false,"message"')
  ) {
    throw new ApiError(
      400,
      "Valid product name is required. Please provide a proper name without error messages."
    );
  }

  // Clean the name to remove any potential error messages
  const cleanName = name.includes('{"success":false,"message"')
    ? "New Product"
    : name.trim();

  // Parse category IDs
  let parsedCategoryIds = [];
  try {
    // Handle both string JSON and array formats
    if (categoryIds) {
      if (Array.isArray(categoryIds)) {
        parsedCategoryIds = categoryIds;
      } else {
        parsedCategoryIds = JSON.parse(categoryIds);
      }
    }

    // If no categories were provided, find or create the default 'Uncategorized' category
    if (!Array.isArray(parsedCategoryIds) || parsedCategoryIds.length === 0) {
      // Try to find the Uncategorized category
      let defaultCategory = await prisma.category.findFirst({
        where: { name: "Uncategorized" },
      });

      // If it doesn't exist, create it
      if (!defaultCategory) {
        const slug = "uncategorized";
        defaultCategory = await prisma.category.create({
          data: {
            name: "Uncategorized",
            slug,
            description:
              "DEFAULT_CATEGORY - Products without a specific category",
          },
        });
      }

      parsedCategoryIds = [defaultCategory.id];
    }
  } catch (error) {
    console.error("Error parsing categoryIds:", error, categoryIds);
    throw new ApiError(400, "Invalid categories format");
  }

  // Set primary category if not provided
  const primaryCategory = primaryCategoryId || parsedCategoryIds[0];

  // Check if all categories exist
  for (const catId of parsedCategoryIds) {
    const category = await prisma.category.findUnique({
      where: { id: catId },
    });

    if (!category) {
      throw new ApiError(404, `Category with ID ${catId} not found`);
    }
  }

  // Generate slug from name
  const slug = createSlug(cleanName);

  // Check if slug already exists
  const existingProduct = await prisma.product.findUnique({
    where: { slug },
  });

  if (existingProduct) {
    throw new ApiError(409, "Product with similar name already exists");
  }

  // Create the product with transaction to ensure variants are created as well
  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Create the product
      let parsedNutritionInfo = null;
      if (nutritionInfo) {
        try {
          parsedNutritionInfo =
            typeof nutritionInfo === "string"
              ? JSON.parse(nutritionInfo)
              : nutritionInfo;
        } catch (error) {
          console.error("Error parsing nutritionInfo:", error);
          parsedNutritionInfo = {};
        }
      }

      const newProduct = await prisma.product.create({
        data: {
          name: cleanName,
          description,
          slug,
          hasVariants: hasVariants === "true" || hasVariants === true,
          isSupplement: isSupplement === "true" || isSupplement === true,
          ingredients,
          nutritionInfo: parsedNutritionInfo,
          featured: featured === "true" || featured === true,
          isActive: isActive === "true" || isActive === true || true,
          metaTitle: metaTitle || cleanName,
          metaDescription: metaDescription || description,
          keywords,
        },
      });

      // Create product-category connections
      for (const catId of parsedCategoryIds) {
        await prisma.productCategory.create({
          data: {
            productId: newProduct.id,
            categoryId: catId,
            isPrimary: catId === primaryCategory,
          },
        });
      }

      // Create product variants
      let variants = [];
      if (variantsJson) {
        try {
          if (typeof variantsJson === "string") {
            if (
              variantsJson.trim().startsWith("[") &&
              variantsJson.trim().endsWith("]")
            ) {
              variants = JSON.parse(variantsJson);
            } else {
              console.warn(
                "Invalid variants JSON string format:",
                variantsJson
              );
              variants = [];
            }
          } else if (Array.isArray(variantsJson)) {
            variants = variantsJson;
          } else {
            console.error(
              "Unexpected variants format:",
              typeof variantsJson,
              variantsJson
            );
            variants = [];
          }

          // Ensure variants is always an array
          if (!Array.isArray(variants)) {
            console.warn("Variants is not an array after parsing:", variants);
            variants = [];
          }

          if (hasVariants === "true" || hasVariants === true) {
            if (variants.length === 0) {
              throw new ApiError(
                400,
                "At least one product variant is required for variant products"
              );
            }
          }
        } catch (error) {
          console.error("Error parsing variants:", error, variantsJson);
          throw new ApiError(
            400,
            `Invalid variants data format: ${error.message}`
          );
        }
      }

      // Get primary category name for SKU generation
      const categoryNames = {};
      for (const catId of parsedCategoryIds) {
        const category = await prisma.category.findUnique({
          where: { id: catId },
          select: { name: true },
        });
        if (category) {
          categoryNames[catId] = category.name;
        }
      }

      let primaryCategoryName = "";
      if (primaryCategory && categoryNames[primaryCategory]) {
        primaryCategoryName = categoryNames[primaryCategory];
      } else if (Object.values(categoryNames).length > 0) {
        // Use the first category if primary is not found
        primaryCategoryName = Object.values(categoryNames)[0];
      }

      // Prepare product info for SKU generation
      const productInfo = {
        name: cleanName,
        categoryName: primaryCategoryName,
        basePrice: req.body.price ? parseFloat(req.body.price) : 0,
      };

      for (const variant of variants) {
        // Get variant details for better SKU generation
        let flavorName = "";
        let weightStr = "";

        if (variant.flavorId) {
          const flavor = await prisma.flavor.findUnique({
            where: { id: variant.flavorId },
          });
          if (flavor) {
            flavorName = flavor.name;
          }
        }

        if (variant.weightId) {
          const weight = await prisma.weight.findUnique({
            where: { id: variant.weightId },
          });
          if (weight) {
            weightStr = `${weight.value}${weight.unit}`;
          }
        }

        // Auto-generate SKU if not provided or if it's a placeholder
        let variantSku = variant.sku;
        if (
          !variantSku ||
          variantSku.trim() === "" ||
          variantSku === "-VAN-50g" ||
          variantSku === "-CHO-250g"
        ) {
          const variantInfo = flavorName + (weightStr ? `-${weightStr}` : "");
          variantSku = generateSKU(productInfo, variantInfo);
        }

        // Check if this SKU already exists
        const existingSku = await prisma.productVariant.findUnique({
          where: { sku: variantSku },
        });

        if (existingSku) {
          // Use our utility to generate a completely new SKU
          variantSku = generateSKU(
            productInfo,
            flavorName + weightStr,
            Math.floor(Math.random() * 100)
          );
        }

        await prisma.productVariant.create({
          data: {
            productId: newProduct.id,
            sku: variantSku,
            flavorId: variant.flavorId || null,
            weightId: variant.weightId || null,
            price: parseFloat(variant.price),
            salePrice: variant.salePrice ? parseFloat(variant.salePrice) : null,
            quantity: parseInt(variant.quantity || 0),
            isActive: variant.isActive !== undefined ? variant.isActive : true,
          },
        });
      }

      // If we don't have any variants and it's not a variant product, create a default variant
      if (
        variants.length === 0 &&
        (hasVariants === "false" ||
          hasVariants === false ||
          hasVariants === undefined)
      ) {
        // Log values for debugging
        console.log("Creating default variant with values:", {
          price: req.body.price,
          salePrice: req.body.salePrice,
          quantity: req.body.quantity,
        });

        // Generate default SKU
        const defaultSku = generateSKU(productInfo, "DEFAULT");

        // Ensure price, salePrice, and quantity are properly parsed
        const price = req.body.price ? parseFloat(req.body.price) : 0;
        const salePrice =
          req.body.salePrice &&
          req.body.salePrice !== "null" &&
          req.body.salePrice !== ""
            ? parseFloat(req.body.salePrice)
            : null;
        const quantity = req.body.quantity ? parseInt(req.body.quantity) : 0;

        // Create the default variant with properly parsed values
        await prisma.productVariant.create({
          data: {
            productId: newProduct.id,
            sku: defaultSku,
            flavorId: null,
            weightId: null,
            price: price,
            salePrice: salePrice,
            quantity: quantity,
            isActive: true,
          },
        });
      }

      // Upload product images if provided
      if (req.files && req.files.length > 0) {
        let primaryImageIndex = 0;

        // Get primary image index from request body
        if (req.body.primaryImageIndex !== undefined) {
          try {
            primaryImageIndex = parseInt(req.body.primaryImageIndex);
            // Ensure it's within valid range
            if (
              isNaN(primaryImageIndex) ||
              primaryImageIndex < 0 ||
              primaryImageIndex >= req.files.length
            ) {
              primaryImageIndex = 0;
            }
          } catch (error) {
            console.error("Error parsing primaryImageIndex:", error);
            primaryImageIndex = 0;
          }
        }

        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          const imageUrl = await processAndUploadImage(
            file,
            `products/${newProduct.id}`
          );

          await prisma.productImage.create({
            data: {
              productId: newProduct.id,
              url: imageUrl,
              alt: `${newProduct.name} - Image ${i + 1}`,
              isPrimary: i === primaryImageIndex,
            },
          });
        }
      } else if (req.file) {
        // For backward compatibility with single image upload
        const imageUrl = await processAndUploadImage(
          req.file,
          `products/${newProduct.id}`
        );

        await prisma.productImage.create({
          data: {
            productId: newProduct.id,
            url: imageUrl,
            alt: newProduct.name,
            isPrimary: true,
          },
        });
      }

      // Return product with relations
      return await prisma.product.findUnique({
        where: { id: newProduct.id },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          images: true,
          variants: {
            include: {
              flavor: true,
              weight: true,
            },
          },
        },
      });
    });

    // Format the response data
    try {
      const formattedProduct = {
        ...result,
        // Extract categories into a more usable format
        categories: result.categories.map((pc) => ({
          id: pc.category.id,
          name: pc.category.name,
          description: pc.category.description,
          image: pc.category.image ? getFileUrl(pc.category.image) : null,
          slug: pc.category.slug,
          isPrimary: pc.isPrimary,
        })),
        primaryCategory:
          result.categories.find((pc) => pc.isPrimary)?.category ||
          (result.categories.length > 0 ? result.categories[0].category : null),
        images: result.images.map((image) => ({
          ...image,
          url: getFileUrl(image.url),
        })),
        variants: result.variants.map((variant) => ({
          ...variant,
          flavor: variant.flavor
            ? {
                ...variant.flavor,
                image: variant.flavor.image
                  ? getFileUrl(variant.flavor.image)
                  : null,
              }
            : null,
        })),
        // Include message when variants couldn't be deleted due to orders
        _message:
          variantIdsWithOrders && variantIdsWithOrders.length > 0
            ? "Some variants could not be deleted because they have associated orders."
            : undefined,
      };

      // Send success response
      res
        .status(201)
        .json(
          new ApiResponsive(
            201,
            { product: formattedProduct },
            "Product created successfully"
          )
        );
    } catch (formattingError) {
      // If formatting fails but product was created, still return success
      console.error("Error formatting product response:", formattingError);
      res.status(201).json(
        new ApiResponsive(
          201,
          {
            product: {
              id: result.id,
              name: result.name,
              slug: result.slug,
            },
          },
          "Product created successfully but encountered error formatting response"
        )
      );
    }
  } catch (error) {
    console.error("Product creation error:", error);
    throw new ApiError(500, `Failed to create product: ${error.message}`);
  }
});

// Update a product
export const updateProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const {
    name,
    description,
    categoryIds,
    primaryCategoryId,
    isSupplement,
    ingredients,
    nutritionInfo,
    featured,
    isActive,
    hasVariants,
    variants: variantsJson,
    price,
    salePrice,
    quantity,
    metaTitle,
    metaDescription,
    keywords,
  } = req.body;

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      images: true,
      variants: true,
    },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Declare variantIdsWithOrders in outer scope so it's available after the transaction
  let variantIdsWithOrders = [];

  // Parse category IDs if provided
  let parsedCategoryIds = [];
  if (categoryIds) {
    try {
      parsedCategoryIds = JSON.parse(categoryIds);
      if (!Array.isArray(parsedCategoryIds)) {
        throw new ApiError(400, "Invalid categories format");
      }
    } catch (error) {
      throw new ApiError(400, "Invalid categories format");
    }
  }

  // In the transaction, update categories if provided
  if (parsedCategoryIds.length > 0 || primaryCategoryId) {
    // Delete existing category connections
    if (parsedCategoryIds.length > 0) {
      await prisma.productCategory.deleteMany({
        where: { productId },
      });

      // Create new category connections
      for (const catId of parsedCategoryIds) {
        await prisma.productCategory.create({
          data: {
            productId,
            categoryId: catId,
            isPrimary: catId === (primaryCategoryId || parsedCategoryIds[0]),
          },
        });
      }
    } else if (primaryCategoryId) {
      // Update the primary category
      // First, set all to not primary
      await prisma.productCategory.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });

      // Then, set the selected one to primary
      await prisma.productCategory.updateMany({
        where: {
          productId,
          categoryId: primaryCategoryId,
        },
        data: { isPrimary: true },
      });
    }
  }

  // If changing the name, update the slug and check if it conflicts
  let slug = product.slug;
  if (name && name !== product.name) {
    slug = createSlug(name);

    // Check if new slug conflicts with existing products
    const existingProduct = await prisma.product.findFirst({
      where: {
        slug,
        id: { not: productId },
      },
    });

    if (existingProduct) {
      throw new ApiError(409, "Product with similar name already exists");
    }
  }

  // Check if category exists if changing
  if (parsedCategoryIds.length > 0 || primaryCategoryId) {
    const categoriesToCheck =
      parsedCategoryIds.length > 0 ? parsedCategoryIds : [primaryCategoryId];

    for (const catId of categoriesToCheck) {
      const category = await prisma.category.findUnique({
        where: { id: catId },
      });

      if (!category) {
        throw new ApiError(404, `Category with ID ${catId} not found`);
      }
    }
  }

  // Update the product with transaction to handle variants and images
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const hasVariantsValue = hasVariants === "true" || hasVariants === true;

      // Update product basic info
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          ...(name && { name }),
          ...(name && { slug }),
          ...(description !== undefined && { description }),
          ...(hasVariants !== undefined && { hasVariants: hasVariantsValue }),
          ...(isSupplement !== undefined && {
            isSupplement: isSupplement === "true" || isSupplement === true,
          }),
          ...(ingredients !== undefined && { ingredients }),
          ...(nutritionInfo && { nutritionInfo: JSON.parse(nutritionInfo) }),
          ...(featured !== undefined && {
            featured: featured === "true" || featured === true,
          }),
          ...(isActive !== undefined && {
            isActive: isActive === "true" || isActive === true,
          }),
          ...(metaTitle !== undefined && { metaTitle }),
          ...(metaDescription !== undefined && { metaDescription }),
          ...(keywords !== undefined && { keywords }),
        },
      });

      // Get all categories for this product after update
      const updatedCategories = await prisma.productCategory.findMany({
        where: { productId },
        include: {
          category: true,
        },
      });

      // Get the primary category or first category
      const primaryCat =
        updatedCategories.find((pc) => pc.isPrimary) ||
        (updatedCategories.length > 0 ? updatedCategories[0] : null);
      const primaryCategoryName = primaryCat?.category?.name || "";

      // Create base SKU for auto-generation
      const namePart = updatedProduct.name
        .substring(0, 3)
        .toUpperCase()
        .replace(/\s+/g, "");
      const categoryPart = primaryCategoryName
        .substring(0, 3)
        .toUpperCase()
        .replace(/\s+/g, "");
      const timestamp = Date.now().toString().slice(-4);
      const baseSku = `${namePart}${categoryPart}${timestamp}`;

      // Handle variants update if provided
      if (variantsJson) {
        let variants = [];
        try {
          variants = JSON.parse(variantsJson);
          if (hasVariantsValue) {
            if (!Array.isArray(variants) || variants.length === 0) {
              throw new ApiError(
                400,
                "At least one product variant is required"
              );
            }
          }
        } catch (error) {
          throw new ApiError(400, "Invalid variants data format");
        }

        // Get existing variant IDs to determine which to update/delete
        const existingVariantIds = product.variants.map((v) => v.id);

        // Get variant IDs that exist in the updated data (only valid DB IDs, not temporary ones)
        const updatedVariantIds = variants
          .filter(
            (v) => v.id && !v.id.startsWith("new-") && !v.id.startsWith("field")
          )
          .map((v) => v.id);

        // Extract existingVariantIds from the request body if provided
        // This helps synchronize frontend and backend state when variants are removed
        let requestExistingVariantIds = [];
        if (req.body.existingVariantIds) {
          try {
            requestExistingVariantIds = JSON.parse(req.body.existingVariantIds);
          } catch (e) {
            // If parsing fails, use the updatedVariantIds instead
            requestExistingVariantIds = updatedVariantIds;
          }
        }

        // If request explicitly provides existingVariantIds, use those to determine what to delete
        // This helps when frontend has tracked variant removals
        const variantIdsToDelete =
          requestExistingVariantIds.length > 0
            ? // Delete only variants that exist in DB but not in the request's existingVariantIds
              existingVariantIds.filter(
                (id) => !requestExistingVariantIds.includes(id)
              )
            : // Fallback to the traditional approach - delete variants not in the updated list
              existingVariantIds.filter(
                (id) => !updatedVariantIds.includes(id)
              );

        // Delete removed variants safely
        if (variantIdsToDelete.length > 0) {
          // Check if any variants have related order items
          const variantsWithOrders = await prisma.orderItem.findMany({
            where: {
              variantId: { in: variantIdsToDelete },
            },
            select: {
              variantId: true,
            },
            distinct: ["variantId"],
          });

          // Assign to outer scope variable instead of creating a new const
          variantIdsWithOrders = variantsWithOrders.map(
            (item) => item.variantId
          );

          if (variantIdsWithOrders.length > 0) {
            // For variants that have orders, mark them as inactive instead of deleting
            await prisma.productVariant.updateMany({
              where: {
                id: { in: variantIdsWithOrders },
              },
              data: {
                isActive: false,
              },
            });

            // Only delete variants that don't have orders
            const safeToDeleteIds = variantIdsToDelete.filter(
              (id) => !variantIdsWithOrders.includes(id)
            );

            if (safeToDeleteIds.length > 0) {
              await prisma.productVariant.deleteMany({
                where: { id: { in: safeToDeleteIds } },
              });
            }

            // Don't try to save notes to the database since the field doesn't exist in the schema            // Just log a message instead            console.log(`Product ${productId}: Some variants could not be deleted because they have associated orders.`);                        // We'll include this message in the API response after the transaction
          } else {
            // If no variants have orders, delete them all
            console.log(
              `Deleting all requested variants: ${variantIdsToDelete.join(
                ", "
              )}`
            );
            await prisma.productVariant.deleteMany({
              where: { id: { in: variantIdsToDelete } },
            });
          }
        }

        // Update or create variants
        for (const variant of variants) {
          // Check if this is an existing variant to update (has a valid DB ID)
          const isExistingVariant =
            variant.id &&
            !variant.id.startsWith("new-") &&
            !variant.id.startsWith("field") &&
            existingVariantIds.includes(variant.id);

          // For existing variants, first check if it still exists in the database
          if (isExistingVariant) {
            const variantExists = await prisma.productVariant.findUnique({
              where: { id: variant.id },
            });

            if (!variantExists) {
              variant.id = null;
            }
          }

          if (isExistingVariant && variant.id) {
            // Update existing variant
            // Auto-generate SKU if not provided
            let variantSku = variant.sku;
            if (
              !variantSku ||
              variantSku.trim() === "" ||
              variantSku === "-VAN-50g" ||
              variantSku === "-CHO-250g"
            ) {
              let suffix = "";

              if (variant.flavorId) {
                const flavor = await prisma.flavor.findUnique({
                  where: { id: variant.flavorId },
                });
                if (flavor) {
                  suffix += `-${flavor.name
                    .substring(0, 3)
                    .toUpperCase()
                    .replace(/\s+/g, "")}`;
                }
              }

              if (variant.weightId) {
                const weight = await prisma.weight.findUnique({
                  where: { id: variant.weightId },
                });
                if (weight) {
                  suffix += `-${weight.value}${weight.unit}`;
                }
              }

              const randomSuffix = Math.floor(Math.random() * 100)
                .toString()
                .padStart(2, "0");
              variantSku = `${baseSku}${suffix}-${randomSuffix}`;
            }

            // Check if this SKU already exists
            const existingSku = await prisma.productVariant.findFirst({
              where: {
                sku: variantSku,
                id: { not: variant.id },
              },
            });

            if (existingSku) {
              // Add a random suffix if auto-generated SKU already exists
              const randomSuffix = Math.floor(Math.random() * 1000)
                .toString()
                .padStart(3, "0");
              variantSku = `${variantSku}-${randomSuffix}`;
            }

            // Better error handling for variant price parsing
            let parsedPrice = 0;
            let parsedSalePrice = null;
            let parsedQuantity = 0;

            try {
              // Parse price with validation
              if (variant.price) {
                parsedPrice = parseFloat(variant.price);
                if (isNaN(parsedPrice)) {
                  console.warn(
                    `Invalid price value: ${variant.price}, defaulting to 0`
                  );
                  parsedPrice = 0;
                }
              }

              // Parse sale price with validation
              if (
                variant.salePrice &&
                variant.salePrice !== "null" &&
                variant.salePrice !== ""
              ) {
                parsedSalePrice = parseFloat(variant.salePrice);
                if (isNaN(parsedSalePrice)) {
                  console.warn(
                    `Invalid sale price value: ${variant.salePrice}, defaulting to null`
                  );
                  parsedSalePrice = null;
                }
              }

              // Parse quantity with validation
              if (variant.quantity) {
                parsedQuantity = parseInt(variant.quantity);
                if (isNaN(parsedQuantity)) {
                  console.warn(
                    `Invalid quantity value: ${variant.quantity}, defaulting to 0`
                  );
                  parsedQuantity = 0;
                }
              }
            } catch (error) {
              console.error(`Error parsing variant data: ${error.message}`);
            }

            await prisma.productVariant.update({
              where: { id: variant.id },
              data: {
                sku: variantSku || variant.sku,
                flavorId: variant.flavorId || null,
                weightId: variant.weightId || null,
                price: parsedPrice,
                salePrice: parsedSalePrice,
                quantity: parsedQuantity,
                isActive:
                  variant.isActive !== undefined ? variant.isActive : true,
              },
            });
          } else {
            // Create new variant
            // Auto-generate SKU if not provided
            let variantSku = variant.sku;
            if (
              !variantSku ||
              variantSku.trim() === "" ||
              variantSku === "-VAN-50g" ||
              variantSku === "-CHO-250g"
            ) {
              let suffix = "";

              if (variant.flavorId) {
                const flavor = await prisma.flavor.findUnique({
                  where: { id: variant.flavorId },
                });
                if (flavor) {
                  suffix += `-${flavor.name
                    .substring(0, 3)
                    .toUpperCase()
                    .replace(/\s+/g, "")}`;
                }
              }

              if (variant.weightId) {
                const weight = await prisma.weight.findUnique({
                  where: { id: variant.weightId },
                });
                if (weight) {
                  suffix += `-${weight.value}${weight.unit}`;
                }
              }

              const randomSuffix = Math.floor(Math.random() * 100)
                .toString()
                .padStart(2, "0");
              variantSku = `${baseSku}${suffix}-${randomSuffix}`;
            }

            // Check if this SKU already exists
            const existingSku = await prisma.productVariant.findUnique({
              where: { sku: variantSku },
            });

            if (existingSku) {
              // Add a random suffix if auto-generated SKU already exists
              const randomSuffix = Math.floor(Math.random() * 1000)
                .toString()
                .padStart(3, "0");
              variantSku = `${variantSku}-${randomSuffix}`;
            }

            // Better error handling for variant price parsing
            let parsedPrice = 0;
            let parsedSalePrice = null;
            let parsedQuantity = 0;

            try {
              // Parse price with validation
              if (variant.price) {
                parsedPrice = parseFloat(variant.price);
                if (isNaN(parsedPrice)) {
                  console.warn(
                    `Invalid price value: ${variant.price}, defaulting to 0`
                  );
                  parsedPrice = 0;
                }
              }

              // Parse sale price with validation
              if (
                variant.salePrice &&
                variant.salePrice !== "null" &&
                variant.salePrice !== ""
              ) {
                parsedSalePrice = parseFloat(variant.salePrice);
                if (isNaN(parsedSalePrice)) {
                  console.warn(
                    `Invalid sale price value: ${variant.salePrice}, defaulting to null`
                  );
                  parsedSalePrice = null;
                }
              }

              // Parse quantity with validation
              if (variant.quantity) {
                parsedQuantity = parseInt(variant.quantity);
                if (isNaN(parsedQuantity)) {
                  console.warn(
                    `Invalid quantity value: ${variant.quantity}, defaulting to 0`
                  );
                  parsedQuantity = 0;
                }
              }
            } catch (error) {
              console.error(`Error parsing variant data: ${error.message}`);
            }

            await prisma.productVariant.create({
              data: {
                productId,
                sku: variantSku || variant.sku,
                flavorId: variant.flavorId || null,
                weightId: variant.weightId || null,
                price: parsedPrice,
                salePrice: parsedSalePrice,
                quantity: parsedQuantity,
                isActive:
                  variant.isActive !== undefined ? variant.isActive : true,
              },
            });
          }
        }
      } else if (
        hasVariants === "false" ||
        hasVariants === false ||
        hasVariants === null ||
        hasVariants === undefined
      ) {
        // If switching to non-variant mode, handle simple product price and quantity
        // If no variants exist, create a default one, otherwise update the first one
        if (product.variants.length === 0) {
          const defaultSku = `${baseSku}-DEF`;

          // Ensure price, salePrice, and quantity are properly parsed
          // Parse price with validation
          let parsedPrice = 0;
          try {
            if (price) {
              parsedPrice = parseFloat(price);
              if (isNaN(parsedPrice)) {
                console.warn(`Invalid price value: ${price}, defaulting to 0`);
                parsedPrice = 0;
              }
            }
          } catch (error) {
            console.error(`Error parsing price: ${error.message}`);
          }

          // Parse sale price with validation
          let parsedSalePrice = null;
          try {
            if (salePrice && salePrice !== "null" && salePrice !== "") {
              parsedSalePrice = parseFloat(salePrice);
              if (isNaN(parsedSalePrice)) {
                console.warn(
                  `Invalid sale price value: ${salePrice}, defaulting to null`
                );
                parsedSalePrice = null;
              }
            }
          } catch (error) {
            console.error(`Error parsing sale price: ${error.message}`);
          }

          // Parse quantity with validation
          let parsedQuantity = 0;
          try {
            if (req.body.quantity) {
              parsedQuantity = parseInt(req.body.quantity);
              if (isNaN(parsedQuantity)) {
                console.warn(
                  `Invalid quantity value: ${req.body.quantity}, defaulting to 0`
                );
                parsedQuantity = 0;
              }
            }
          } catch (error) {
            console.error(`Error parsing quantity: ${error.message}`);
          }

          await prisma.productVariant.create({
            data: {
              productId,
              sku: defaultSku,
              flavorId: null,
              weightId: null,
              price: parsedPrice,
              salePrice: parsedSalePrice,
              quantity: parsedQuantity,
              isActive: true,
            },
          });
        } else {
          // Always update the price and other fields, even if they're not explicitly defined in the request
          // This fixes the issue where price wasn't updating when hasVariants was null

          // Robust parsing for price, salePrice, and quantity
          const updateData = {};

          // Parse price with enhanced validation and debugging
          try {
            // Log the raw price to diagnose issues
            console.log(
              `Raw price received: '${price}', type: ${typeof price}`
            );

            if (price !== undefined) {
              // Try to parse as integer first then as float if necessary
              let parsedPrice;

              // Remove any formatting characters that might be causing issues
              const cleanPrice = String(price).replace(/[^\d.-]/g, "");
              console.log(`Cleaned price string: '${cleanPrice}'`);

              parsedPrice = parseFloat(cleanPrice);

              if (!isNaN(parsedPrice)) {
                updateData.price = parsedPrice;
                console.log(`Parsed price as number: ${parsedPrice}`);
              } else {
                console.warn(
                  `Invalid price value: ${price}, using existing price`
                );
                updateData.price = parseFloat(product.variants[0].price);
                console.log(`Using existing price: ${updateData.price}`);
              }
            } else {
              // Price is required, so use existing value if not provided
              updateData.price = parseFloat(product.variants[0].price);
              console.log(
                `Price not in request, using existing: ${updateData.price}`
              );
            }
          } catch (error) {
            console.error(`Error parsing price: ${error.message}`);
            updateData.price = parseFloat(product.variants[0].price);
          }

          // Parse sale price with validation - more aggressive checking
          try {
            // Log the raw sale price coming in to diagnose issues
            console.log(
              `Raw sale price received: '${salePrice}', type: ${typeof salePrice}`
            );

            // Consider salePrice as defined if it exists in the request
            if (salePrice !== undefined) {
              // Only set a non-null sale price if we have a valid number
              if (salePrice && salePrice !== "null" && salePrice !== "") {
                const parsedSalePrice = parseFloat(salePrice);
                if (!isNaN(parsedSalePrice)) {
                  updateData.salePrice = parsedSalePrice;
                  console.log(
                    `Parsed sale price as number: ${parsedSalePrice}`
                  );
                } else {
                  console.warn(
                    `Invalid sale price value: ${salePrice}, defaulting to null`
                  );
                  updateData.salePrice = null;
                }
              } else {
                console.log(
                  `Setting sale price to null because value is empty or null`
                );
                updateData.salePrice = null;
              }
            } else {
              console.log(
                `Sale price not provided in request, keeping existing value`
              );
              // Don't include salePrice in the update if it wasn't in the request
              // This means remove the salePrice key from updateData to prevent updates
              delete updateData.salePrice;
            }
          } catch (error) {
            console.error(`Error parsing sale price: ${error.message}`);
            // Don't update on error
            delete updateData.salePrice;
          }

          // Parse quantity with validation
          try {
            if (quantity !== undefined) {
              const parsedQuantity = parseInt(quantity);
              if (!isNaN(parsedQuantity)) {
                updateData.quantity = parsedQuantity;
              } else {
                console.warn(
                  `Invalid quantity value: ${quantity}, keeping existing quantity`
                );
                // Don't update quantity if invalid
              }
            }
          } catch (error) {
            console.error(`Error parsing quantity: ${error.message}`);
            // Don't update quantity on error
          }

          // Output debug info to check what's happening
          console.log("Updating variant with ID:", product.variants[0].id);
          console.log(
            "Update data to apply:",
            JSON.stringify(updateData, null, 2)
          );

          // Direct database update using raw SQL to bypass any Prisma caching issues
          if (price !== undefined) {
            await prisma.$executeRaw`
              UPDATE "ProductVariant" 
              SET "price" = ${String(updateData.price)}, 
                  "updatedAt" = NOW() 
              WHERE "id" = ${product.variants[0].id};
            `;
            console.log("Updated price with direct SQL:", updateData.price);
          }

          // Handle sale price
          if (salePrice !== undefined) {
            await prisma.$executeRaw`
              UPDATE "ProductVariant" 
              SET "salePrice" = ${
                updateData.salePrice === null
                  ? null
                  : String(updateData.salePrice)
              }, 
                  "updatedAt" = NOW() 
              WHERE "id" = ${product.variants[0].id};
            `;
            console.log(
              "Updated sale price with direct SQL:",
              updateData.salePrice
            );
          }

          // Handle quantity
          if (quantity !== undefined) {
            await prisma.$executeRaw`
              UPDATE "ProductVariant" 
              SET "quantity" = ${updateData.quantity}, 
                  "updatedAt" = NOW() 
              WHERE "id" = ${product.variants[0].id};
            `;
            console.log(
              "Updated quantity with direct SQL:",
              updateData.quantity
            );
          }
        }
      }

      // Handle image uploads if provided
      if (req.files && req.files.length > 0) {
        const primaryImageIndex = req.body.primaryImageIndex
          ? parseInt(req.body.primaryImageIndex)
          : 0;

        // If replacing all images, delete existing ones first
        if (req.body.replaceAllImages === "true") {
          try {
            console.log("Replacing all product images...");
            // Delete image files from storage
            for (const image of product.images) {
              console.log(`Deleting image from S3: ${image.url}`);
              await deleteFromS3(image.url);
            }

            // Delete from database
            await prisma.productImage.deleteMany({
              where: { productId },
            });
          } catch (error) {
            console.error("Error deleting existing images:", error);
            // Continue with upload even if deletion has issues
          }
        }

        // Upload new images
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          const imageUrl = await processAndUploadImage(
            file,
            `products/${productId}`
          );

          await prisma.productImage.create({
            data: {
              productId,
              url: imageUrl,
              alt: `${updatedProduct.name} - Image ${i + 1}`,
              isPrimary: i === primaryImageIndex,
            },
          });
        }
      } else if (req.file) {
        try {
          // For backward compatibility with single image upload
          // Delete existing primary image if any
          const primaryImage = product.images.find((img) => img.isPrimary);
          if (primaryImage) {
            console.log(`Deleting primary image from S3: ${primaryImage.url}`);
            await deleteFromS3(primaryImage.url);
            await prisma.productImage.delete({
              where: { id: primaryImage.id },
            });
          }

          // Upload new primary image
          const imageUrl = await processAndUploadImage(
            req.file,
            `products/${productId}`
          );

          await prisma.productImage.create({
            data: {
              productId,
              url: imageUrl,
              alt: updatedProduct.name,
              isPrimary: true,
            },
          });
        } catch (error) {
          console.error("Error updating primary image:", error);
          // Continue with response even if image upload fails
        }
      }

      // Get the current state of variants to ensure we have the latest data
      const refreshedVariants = await prisma.$queryRaw`
        SELECT * FROM "ProductVariant" WHERE "productId" = ${productId};
      `;

      console.log(
        "Refreshed variants:",
        JSON.stringify(refreshedVariants, null, 2)
      );

      // Get the full product with fresh data
      const freshProduct = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          images: true,
          variants: {
            include: {
              flavor: true,
              weight: true,
            },
          },
        },
      });

      // Force update the variant data in the result to ensure it's fresh
      if (
        freshProduct &&
        freshProduct.variants &&
        freshProduct.variants.length > 0
      ) {
        for (const variant of freshProduct.variants) {
          const refreshedVariant = refreshedVariants.find(
            (v) => v.id === variant.id
          );
          if (refreshedVariant) {
            // Explicitly update the fields that might be stale
            variant.price = refreshedVariant.price;
            variant.salePrice = refreshedVariant.salePrice;
            variant.quantity = refreshedVariant.quantity;
            variant.updatedAt = refreshedVariant.updatedAt;
          }
        }
      }

      return freshProduct;
    });

    // Format the response data
    const formattedProduct = {
      ...result,
      // Extract categories into a more usable format
      categories: result.categories.map((pc) => ({
        id: pc.category.id,
        name: pc.category.name,
        description: pc.category.description,
        image: pc.category.image ? getFileUrl(pc.category.image) : null,
        slug: pc.category.slug,
        isPrimary: pc.isPrimary,
      })),
      primaryCategory:
        result.categories.find((pc) => pc.isPrimary)?.category ||
        (result.categories.length > 0 ? result.categories[0].category : null),
      images: result.images.map((image) => ({
        ...image,
        url: getFileUrl(image.url),
      })),
      variants: result.variants.map((variant) => ({
        ...variant,
        flavor: variant.flavor
          ? {
              ...variant.flavor,
              image: variant.flavor.image
                ? getFileUrl(variant.flavor.image)
                : null,
            }
          : null,
      })),
      // Include message when variants couldn't be deleted due to orders
      _message:
        variantIdsWithOrders && variantIdsWithOrders.length > 0
          ? "Some variants could not be deleted because they have associated orders."
          : undefined,
    };

    res
      .status(200)
      .json(
        new ApiResponsive(
          200,
          { product: formattedProduct },
          "Product updated successfully"
        )
      );
  } catch (error) {
    console.error("Product update error:", error);
    throw new ApiError(500, `Failed to update product: ${error.message}`);
  }
});

// Delete product
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { force } = req.query; // Add force parameter

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: true,
      variants: true,
      reviews: true,
      orderItems: true,
    },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check if product has any order items and force is not true
  if (product.orderItems.length > 0 && force !== "true") {
    // Instead of updating to inactive, just return with a message explaining the situation
    res
      .status(200)
      .json(
        new ApiResponsive(
          200,
          {},
          "Product has associated orders and cannot be deleted. Use force=true to delete permanently."
        )
      );
    return;
  }

  // Delete product and related entities
  try {
    await prisma.$transaction(async (tx) => {
      // Delete all product images from S3
      for (const image of product.images) {
        await deleteFromS3(image.url);
      }

      // If force deleting a product with orders, handle the order items
      if (product.orderItems.length > 0 && force === "true") {
        // First delete order items referencing this product
        await tx.orderItem.deleteMany({
          where: { productId },
        });
      }

      // Delete product and all related items (cascading deletes)
      await tx.product.delete({
        where: { id: productId },
      });
    });

    res
      .status(200)
      .json(new ApiResponsive(200, {}, "Product deleted successfully"));
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new ApiError(500, `Failed to delete product: ${error.message}`);
  }
});

// Upload product image
export const uploadProductImage = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { isPrimary } = req.body;

  if (!req.file) {
    throw new ApiError(400, "Image file is required");
  }

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: true,
    },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  try {
    // Process and upload image to S3
    const imageUrl = await processAndUploadImage(
      req.file,
      `products/${productId}`
    );

    // Use a transaction to ensure all database operations complete together
    const result = await prisma.$transaction(async (tx) => {
      // If setting as primary, update other images to not be primary
      if (isPrimary === "true" || isPrimary === true) {
        await tx.productImage.updateMany({
          where: {
            productId,
            isPrimary: true,
          },
          data: { isPrimary: false },
        });
      }

      // Create image record
      return await tx.productImage.create({
        data: {
          productId,
          url: imageUrl,
          alt: req.body.alt || product.name,
          isPrimary: isPrimary === "true" || isPrimary === true,
        },
      });
    });

    // Format response with full URL
    const formattedImage = {
      ...result,
      url: getFileUrl(imageUrl),
    };

    res
      .status(201)
      .json(
        new ApiResponsive(
          201,
          { image: formattedImage },
          "Product image uploaded successfully"
        )
      );
  } catch (error) {
    console.error("Image upload error:", error);
    throw new ApiError(500, `Failed to upload image: ${error.message}`);
  }
});

// Delete product image
export const deleteProductImage = asyncHandler(async (req, res, next) => {
  const { imageId } = req.params;

  // Check if image exists
  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
    include: {
      product: {
        select: {
          id: true,
          images: {
            select: { id: true, isPrimary: true, url: true },
          },
        },
      },
    },
  });

  if (!image) {
    throw new ApiError(404, "Image not found");
  }

  // Prevent deleting if it's the only image for the product
  if (image.product.images.length === 1) {
    throw new ApiError(400, "Cannot delete the only image for this product");
  }

  try {
    // Delete image from S3
    console.log(`Deleting image from S3: ${image.url}`);
    await deleteFromS3(image.url);

    // Check if this was the primary image
    const isPrimary = image.isPrimary;

    // Delete image record from database
    await prisma.productImage.delete({
      where: { id: imageId },
    });

    // If deleted image was primary, set the first remaining image as primary
    if (isPrimary) {
      const remainingImages = image.product.images.filter(
        (img) => img.id !== imageId
      );
      if (remainingImages.length > 0) {
        await prisma.productImage.update({
          where: { id: remainingImages[0].id },
          data: { isPrimary: true },
        });
      }
    }

    res
      .status(200)
      .json(new ApiResponsive(200, {}, "Product image deleted successfully"));
  } catch (error) {
    console.error("Error deleting image:", error);
    throw new ApiError(500, `Failed to delete image: ${error.message}`);
  }
});

// Create product variant
export const createProductVariant = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { sku, flavorId, weightId, price, salePrice, quantity } = req.body;

  // Validate required fields
  if (!price || !quantity) {
    throw new ApiError(400, "Price and quantity are required");
  }

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Get primary category name for SKU generation
  const primaryCategory =
    product.categories.find((cat) => cat.isPrimary) ||
    (product.categories.length > 0 ? product.categories[0] : null);

  const categoryName = primaryCategory ? primaryCategory.category.name : "";

  // Get flavor and weight info for variant name
  let flavorName = "";
  let weightStr = "";

  if (flavorId) {
    const flavor = await prisma.flavor.findUnique({
      where: { id: flavorId },
    });
    if (flavor) {
      flavorName = flavor.name;
    }
  }

  if (weightId) {
    const weight = await prisma.weight.findUnique({
      where: { id: weightId },
    });
    if (weight) {
      weightStr = `${weight.value}${weight.unit}`;
    }
  }

  // Prepare product info for SKU generation
  const productInfo = {
    name: product.name,
    categoryName: categoryName,
    basePrice: parseFloat(price),
  };

  // Auto-generate SKU if not provided
  let variantSku = sku;
  if (!variantSku || variantSku.trim() === "") {
    const variantInfo = flavorName + (weightStr ? `-${weightStr}` : "");
    variantSku = generateSKU(productInfo, variantInfo);
  }

  // Check if this SKU already exists
  const existingSku = await prisma.productVariant.findUnique({
    where: { sku: variantSku },
  });

  if (existingSku) {
    // Generate a completely new unique SKU
    variantSku = generateSKU(
      productInfo,
      flavorName + weightStr,
      Math.floor(Math.random() * 100)
    );
  }

  // Create variant
  const variant = await prisma.productVariant.create({
    data: {
      productId,
      sku: variantSku,
      flavorId: flavorId || null,
      weightId: weightId || null,
      price: parseFloat(price),
      salePrice: salePrice ? parseFloat(salePrice) : null,
      quantity: parseInt(quantity),
    },
    include: {
      flavor: true,
      weight: true,
    },
  });

  res
    .status(201)
    .json(
      new ApiResponsive(
        201,
        { variant },
        "Product variant created successfully"
      )
    );
});

// Update product variant
export const updateProductVariant = asyncHandler(async (req, res, next) => {
  const { variantId } = req.params;
  const { sku, flavorId, weightId, price, salePrice, quantity, isActive } =
    req.body;

  // Check if variant exists
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });

  if (!variant) {
    throw new ApiError(404, "Product variant not found");
  }

  // If no SKU provided and trying to change flavor/weight, auto-generate a new one
  let variantSku = sku;
  if (
    !variantSku &&
    (flavorId !== variant.flavorId || weightId !== variant.weightId)
  ) {
    // Fetch product with categories
    const product = await prisma.product.findUnique({
      where: { id: variant.productId },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    const namePart = product.name
      .substring(0, 3)
      .toUpperCase()
      .replace(/\s+/g, "");
    const categoryName =
      product.categories.length > 0
        ? product.categories[0].category.name
        : "CAT";
    const categoryPart = categoryName
      .substring(0, 3)
      .toUpperCase()
      .replace(/\s+/g, "");

    let suffix = "";
    const newFlavorId = flavorId !== undefined ? flavorId : variant.flavorId;
    const newWeightId = weightId !== undefined ? weightId : variant.weightId;

    if (newFlavorId) {
      const flavor = await prisma.flavor.findUnique({
        where: { id: newFlavorId },
      });
      if (flavor) {
        suffix += `-${flavor.name.substring(0, 3).toUpperCase()}`;
      }
    }

    if (newWeightId) {
      const weight = await prisma.weight.findUnique({
        where: { id: newWeightId },
      });
      if (weight) {
        suffix += `-${weight.value}${weight.unit}`;
      }
    }

    const timestamp = Date.now().toString().slice(-4);
    variantSku = `${namePart}${categoryPart}${timestamp}${suffix}`;
  }

  // Check if SKU already exists (if changing)
  if (variantSku && variantSku !== variant.sku) {
    const existingSku = await prisma.productVariant.findFirst({
      where: {
        sku: variantSku,
        id: { not: variantId },
      },
    });

    if (existingSku) {
      // If auto-generated SKU exists, add a random suffix
      if (!sku) {
        const randomSuffix = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0");
        variantSku = `${variantSku}-${randomSuffix}`;
      } else {
        throw new ApiError(409, "SKU already exists");
      }
    }
  }

  // Check if this flavor+weight combination already exists (if changing)
  if (
    flavorId !== undefined &&
    weightId !== undefined &&
    (flavorId !== variant.flavorId || weightId !== variant.weightId)
  ) {
    const existingVariant = await prisma.productVariant.findFirst({
      where: {
        productId: variant.productId,
        flavorId: flavorId || null,
        weightId: weightId || null,
        id: { not: variantId },
      },
    });

    if (existingVariant) {
      throw new ApiError(
        409,
        "A variant with this flavor and weight combination already exists"
      );
    }
  }

  // Prepare update data
  const updateData = {
    ...(variantSku && { sku: variantSku }),
    ...(flavorId !== undefined && { flavorId: flavorId || null }),
    ...(weightId !== undefined && { weightId: weightId || null }),
    ...(price !== undefined && { price: parseFloat(price) }),
    ...(salePrice !== undefined && {
      salePrice: salePrice ? parseFloat(salePrice) : null,
    }),
    ...(quantity !== undefined && { quantity: parseInt(quantity) }),
    ...(isActive !== undefined && {
      isActive: isActive === "true" || isActive === true,
    }),
  };

  // Update variant
  const updatedVariant = await prisma.productVariant.update({
    where: { id: variantId },
    data: updateData,
    include: {
      flavor: true,
      weight: true,
    },
  });

  // If updating quantity, log the inventory change
  if (quantity !== undefined) {
    await prisma.inventoryLog.create({
      data: {
        variantId,
        quantityChange: parseInt(quantity) - variant.quantity,
        reason: "adjustment",
        previousQuantity: variant.quantity,
        newQuantity: parseInt(quantity),
        notes: "Admin adjustment",
        createdBy: req.admin.id,
      },
    });
  }

  res
    .status(200)
    .json(
      new ApiResponsive(
        200,
        { variant: updatedVariant },
        "Product variant updated successfully"
      )
    );
});

// Delete product variant
export const deleteProductVariant = asyncHandler(async (req, res, next) => {
  const { variantId } = req.params;
  const { force } = req.query; // Add force parameter

  // Check if variant exists
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: {
      product: {
        select: {
          id: true,
          variants: {
            select: { id: true },
          },
        },
      },
      orderItems: true,
    },
  });

  if (!variant) {
    throw new ApiError(404, "Product variant not found");
  }

  // Prevent deleting if it's the only variant for the product
  if (variant.product.variants.length === 1) {
    throw new ApiError(400, "Cannot delete the only variant for this product");
  }

  // If variant has order items and force is not true, return a message
  if (variant.orderItems.length > 0 && force !== "true") {
    res
      .status(200)
      .json(
        new ApiResponsive(
          200,
          {},
          "Product variant has associated orders and cannot be deleted. Use force=true to delete permanently."
        )
      );
    return;
  }

  // Delete variant with transaction if needed
  if (variant.orderItems.length > 0 && force === "true") {
    await prisma.$transaction(async (tx) => {
      // Delete order items associated with this variant
      await tx.orderItem.deleteMany({
        where: { variantId },
      });

      // Then delete the variant
      await tx.productVariant.delete({
        where: { id: variantId },
      });
    });
  } else {
    // Just delete the variant if no orders
    await prisma.productVariant.delete({
      where: { id: variantId },
    });
  }

  res
    .status(200)
    .json(new ApiResponsive(200, {}, "Product variant deleted successfully"));
});

// Get all flavors
export const getFlavors = asyncHandler(async (req, res, next) => {
  const flavors = await prisma.flavor.findMany();

  // Format flavors with proper image URLs
  const formattedFlavors = flavors.map((flavor) => ({
    ...flavor,
    image: flavor.image ? getFileUrl(flavor.image) : null,
  }));

  res
    .status(200)
    .json(
      new ApiResponsive(
        200,
        { flavors: formattedFlavors },
        "Flavors fetched successfully"
      )
    );
});

// Create a new flavor
export const createFlavor = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  if (!name) {
    throw new ApiError(400, "Flavor name is required");
  }

  // Check if flavor already exists
  const existingFlavor = await prisma.flavor.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });

  if (existingFlavor) {
    throw new ApiError(409, "Flavor already exists");
  }

  let imageUrl = null;

  // Process image if provided
  if (req.file) {
    try {
      imageUrl = await processAndUploadImage(req.file, "flavors");
      console.log(`Uploaded flavor image to S3: ${imageUrl}`);
    } catch (error) {
      console.error("Error uploading flavor image:", error);
      throw new ApiError(
        500,
        `Failed to upload flavor image: ${error.message}`
      );
    }
  }

  // Create flavor
  const flavor = await prisma.flavor.create({
    data: {
      name,
      description,
      image: imageUrl,
    },
  });

  // Format response with image URL
  const formattedFlavor = {
    ...flavor,
    image: flavor.image ? getFileUrl(flavor.image) : null,
  };

  res
    .status(201)
    .json(
      new ApiResponsive(
        201,
        { flavor: formattedFlavor },
        "Flavor created successfully"
      )
    );
});

// Update flavor
export const updateFlavor = asyncHandler(async (req, res, next) => {
  const { flavorId } = req.params;
  const { name, description } = req.body;

  // Check if flavor exists
  const flavor = await prisma.flavor.findUnique({
    where: { id: flavorId },
  });

  if (!flavor) {
    throw new ApiError(404, "Flavor not found");
  }

  // Check if name already exists (if changing)
  if (name && name !== flavor.name) {
    const existingFlavor = await prisma.flavor.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        id: { not: flavorId },
      },
    });

    if (existingFlavor) {
      throw new ApiError(409, "Flavor name already exists");
    }
  }

  // Prepare update data
  const updateData = {
    ...(name && { name }),
    ...(description !== undefined && { description }),
  };

  // Handle image update
  if (req.file) {
    try {
      // Delete old image if exists
      if (flavor.image) {
        console.log(`Deleting old flavor image from S3: ${flavor.image}`);
        await deleteFromS3(flavor.image);
      }

      // Upload new image and add to update data
      const imageUrl = await processAndUploadImage(req.file, "flavors");
      updateData.image = imageUrl;
    } catch (error) {
      console.error("Error handling flavor image:", error);
      throw new ApiError(
        500,
        `Failed to update flavor image: ${error.message}`
      );
    }
  }

  // Update flavor
  const updatedFlavor = await prisma.flavor.update({
    where: { id: flavorId },
    data: updateData,
  });

  // Format response with image URL
  const formattedFlavor = {
    ...updatedFlavor,
    image: updatedFlavor.image ? getFileUrl(updatedFlavor.image) : null,
  };

  res
    .status(200)
    .json(
      new ApiResponsive(
        200,
        { flavor: formattedFlavor },
        "Flavor updated successfully"
      )
    );
});

// Delete flavor
export const deleteFlavor = asyncHandler(async (req, res, next) => {
  const { flavorId } = req.params;
  const { force } = req.query; // Add force parameter

  // Check if flavor exists
  const flavor = await prisma.flavor.findUnique({
    where: { id: flavorId },
    include: {
      productVariants: true,
    },
  });

  if (!flavor) {
    throw new ApiError(404, "Flavor not found");
  }

  // Check if flavor is in use
  if (flavor.productVariants.length > 0 && force !== "true") {
    throw new ApiError(
      400,
      "Cannot delete flavor that is in use by product variants"
    );
  }

  try {
    // Handle deletion with transaction if force is true and flavor has variants
    if (flavor.productVariants.length > 0 && force === "true") {
      await prisma.$transaction(async (tx) => {
        // Update all product variants to remove this flavor
        await tx.productVariant.updateMany({
          where: { flavorId },
          data: { flavorId: null },
        });

        // Delete flavor image if exists
        if (flavor.image) {
          console.log(`Deleting flavor image from S3: ${flavor.image}`);
          await deleteFromS3(flavor.image);
        }

        // Delete flavor
        await tx.flavor.delete({
          where: { id: flavorId },
        });
      });
    } else {
      // Regular deletion (no variants)
      // Delete flavor image if exists
      if (flavor.image) {
        console.log(`Deleting flavor image from S3: ${flavor.image}`);
        await deleteFromS3(flavor.image);
      }

      // Delete flavor
      await prisma.flavor.delete({
        where: { id: flavorId },
      });
    }

    res
      .status(200)
      .json(new ApiResponsive(200, {}, "Flavor deleted successfully"));
  } catch (error) {
    console.error("Error deleting flavor:", error);
    throw new ApiError(500, `Failed to delete flavor: ${error.message}`);
  }
});

// Get all weights
export const getWeights = asyncHandler(async (req, res, next) => {
  const weights = await prisma.weight.findMany({
    orderBy: { value: "asc" },
  });

  // Format weights with display value
  const formattedWeights = weights.map((weight) => ({
    ...weight,
    display: `${weight.value}${weight.unit}`,
  }));

  res
    .status(200)
    .json(
      new ApiResponsive(
        200,
        { weights: formattedWeights },
        "Weights fetched successfully"
      )
    );
});

// Create a new weight
export const createWeight = asyncHandler(async (req, res, next) => {
  const { value, unit } = req.body;

  if (!value || !unit) {
    throw new ApiError(400, "Weight value and unit are required");
  }

  // Check if weight already exists
  const existingWeight = await prisma.weight.findFirst({
    where: {
      value: parseFloat(value),
      unit,
    },
  });

  if (existingWeight) {
    throw new ApiError(409, "Weight already exists");
  }

  // Create weight
  const weight = await prisma.weight.create({
    data: {
      value: parseFloat(value),
      unit,
    },
  });

  res
    .status(201)
    .json(new ApiResponsive(201, { weight }, "Weight created successfully"));
});

// Update weight
export const updateWeight = asyncHandler(async (req, res, next) => {
  const { weightId } = req.params;
  const { value, unit } = req.body;

  // Check if weight exists
  const weight = await prisma.weight.findUnique({
    where: { id: weightId },
  });

  if (!weight) {
    throw new ApiError(404, "Weight not found");
  }

  // Check if updated weight already exists
  if (
    (value !== undefined || unit !== undefined) &&
    (parseFloat(value) !== weight.value || unit !== weight.unit)
  ) {
    const existingWeight = await prisma.weight.findFirst({
      where: {
        value: value !== undefined ? parseFloat(value) : weight.value,
        unit: unit || weight.unit,
        id: { not: weightId },
      },
    });

    if (existingWeight) {
      throw new ApiError(409, "Weight already exists");
    }
  }

  // Update weight
  const updatedWeight = await prisma.weight.update({
    where: { id: weightId },
    data: {
      ...(value !== undefined && { value: parseFloat(value) }),
      ...(unit && { unit }),
    },
  });

  res
    .status(200)
    .json(
      new ApiResponsive(
        200,
        { weight: updatedWeight },
        "Weight updated successfully"
      )
    );
});

// Delete weight
export const deleteWeight = asyncHandler(async (req, res, next) => {
  const { weightId } = req.params;

  // Check if weight exists
  const weight = await prisma.weight.findUnique({
    where: { id: weightId },
    include: {
      productVariants: true,
    },
  });

  if (!weight) {
    throw new ApiError(404, "Weight not found");
  }

  // Check if weight is in use
  if (weight.productVariants.length > 0) {
    throw new ApiError(
      400,
      "Cannot delete weight that is in use by product variants"
    );
  }

  // Delete weight
  await prisma.weight.delete({
    where: { id: weightId },
  });

  res
    .status(200)
    .json(new ApiResponsive(200, {}, "Weight deleted successfully"));
});

// Handle bulk variant operations (add, update, delete multiple variants)
export const bulkVariantOperations = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { variants, variantsToDelete } = req.body;

  // Validate request
  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Process operations in a transaction
  const result = await prisma.$transaction(async (tx) => {
    let updatedVariants = [];

    // 1. Delete variants if specified
    if (
      variantsToDelete &&
      Array.isArray(variantsToDelete) &&
      variantsToDelete.length > 0
    ) {
      // Validate that these variants belong to this product
      const variantsToDeleteCount = await tx.productVariant.count({
        where: {
          id: { in: variantsToDelete },
          productId: productId,
        },
      });

      if (variantsToDeleteCount !== variantsToDelete.length) {
        throw new ApiError(
          400,
          "Some variants to delete do not belong to this product"
        );
      }

      await tx.productVariant.deleteMany({
        where: {
          id: { in: variantsToDelete },
        },
      });

      console.log(`Deleted ${variantsToDeleteCount} variants`);
    }

    // 2. Update or create variants
    if (variants && Array.isArray(variants) && variants.length > 0) {
      // Create base SKU for auto-generation if needed
      let baseSku = "";
      if (variants.some((v) => !v.sku || v.sku.trim() === "")) {
        const namePart = product.name
          .substring(0, 3)
          .toUpperCase()
          .replace(/\s+/g, "");
        const timestamp = Date.now().toString().slice(-4);
        baseSku = `${namePart}${timestamp}`;
      }

      for (const variant of variants) {
        if (
          variant.id &&
          !variant.id.startsWith("new-") &&
          !variant.id.startsWith("field")
        ) {
          // Existing variant - update it
          try {
            const updatedVariant = await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                name: variant.name,
                sku: variant.sku,
                price: parseFloat(variant.price || 0),
                salePrice: variant.salePrice
                  ? parseFloat(variant.salePrice)
                  : null,
                quantity: parseInt(variant.quantity || variant.stock || 0),
                isActive:
                  variant.isActive !== undefined ? variant.isActive : true,
                flavorId: variant.flavorId || null,
                weightId: variant.weightId || null,
              },
              include: {
                flavor: true,
                weight: true,
              },
            });

            updatedVariants.push(updatedVariant);
          } catch (error) {
            // If variant not found, create a new one instead
            if (error.code === "P2025") {
              console.log(`Variant ${variant.id} not found, creating new`);
              const newVariant = await tx.productVariant.create({
                data: {
                  productId,
                  name: variant.name,
                  sku:
                    variant.sku ||
                    `${baseSku}-${Math.floor(Math.random() * 1000)}`,
                  price: parseFloat(variant.price || 0),
                  salePrice: variant.salePrice
                    ? parseFloat(variant.salePrice)
                    : null,
                  quantity: parseInt(variant.quantity || variant.stock || 0),
                  isActive:
                    variant.isActive !== undefined ? variant.isActive : true,
                  flavorId: variant.flavorId || null,
                  weightId: variant.weightId || null,
                },
                include: {
                  flavor: true,
                  weight: true,
                },
              });

              updatedVariants.push(newVariant);
            } else {
              throw error;
            }
          }
        } else {
          // New variant - create it
          const newVariant = await tx.productVariant.create({
            data: {
              productId,
              name: variant.name,
              sku:
                variant.sku || `${baseSku}-${Math.floor(Math.random() * 1000)}`,
              price: parseFloat(variant.price || 0),
              salePrice: variant.salePrice
                ? parseFloat(variant.salePrice)
                : null,
              quantity: parseInt(variant.quantity || variant.stock || 0),
              isActive:
                variant.isActive !== undefined ? variant.isActive : true,
              flavorId: variant.flavorId || null,
              weightId: variant.weightId || null,
            },
            include: {
              flavor: true,
              weight: true,
            },
          });

          updatedVariants.push(newVariant);
        }
      }
    }

    // Return all variants for this product after operations
    return await tx.productVariant.findMany({
      where: { productId },
      include: {
        flavor: true,
        weight: true,
      },
    });
  });

  // Format the response
  const formattedVariants = result.map((variant) => ({
    ...variant,
    flavor: variant.flavor
      ? {
          ...variant.flavor,
          image: variant.flavor.image ? getFileUrl(variant.flavor.image) : null,
        }
      : null,
  }));

  res
    .status(200)
    .json(
      new ApiResponsive(
        200,
        { variants: formattedVariants },
        "Product variants updated successfully"
      )
    );
});
