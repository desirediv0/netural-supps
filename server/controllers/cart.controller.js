import { ApiError } from "../utils/ApiError.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../config/db.js";
import { getFileUrl } from "../utils/deleteFromS3.js";

// Get user's cart
export const getUserCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get cart items with product and variant details
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      productVariant: {
        include: {
          product: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
          flavor: true,
          weight: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate cart totals
  let subtotal = 0;
  const formattedItems = cartItems.map((item) => {
    const variant = item.productVariant;
    const price = variant.salePrice || variant.price;
    const itemTotal = parseFloat(price) * item.quantity;
    subtotal += itemTotal;

    // Format the response
    return {
      id: item.id,
      quantity: item.quantity,
      price: price,
      subtotal: itemTotal,
      variant: {
        id: variant.id,
        sku: variant.sku,
        flavor: variant.flavor,
        weight: variant.weight,
      },
      product: {
        id: variant.product.id,
        name: variant.product.name,
        slug: variant.product.slug,
        image: variant.product.images[0]
          ? getFileUrl(variant.product.images[0].url)
          : null,
      },
    };
  });

  res.status(200).json(
    new ApiResponsive(
      200,
      {
        items: formattedItems,
        subtotal,
        itemCount: cartItems.length,
        totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      },
      "Cart fetched successfully"
    )
  );
});

// Add item to cart
export const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productVariantId, quantity = 1 } = req.body;

  if (!productVariantId) {
    throw new ApiError(400, "Product variant ID is required");
  }

  // Validate quantity
  if (quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1");
  }

  // Check if product variant exists and is active
  const productVariant = await prisma.productVariant.findFirst({
    where: {
      id: productVariantId,
      isActive: true,
      product: {
        isActive: true,
      },
    },
    include: {
      product: true,
    },
  });

  if (!productVariant) {
    throw new ApiError(404, "Product variant not found or inactive");
  }

  // Check stock availability
  if (productVariant.quantity < quantity) {
    throw new ApiError(400, "Not enough stock available");
  }

  // Check if item already exists in cart
  const existingCartItem = await prisma.cartItem.findUnique({
    where: {
      userId_productVariantId: {
        userId,
        productVariantId,
      },
    },
  });

  let cartItem;

  if (existingCartItem) {
    // Update quantity if item already exists
    const newQuantity = existingCartItem.quantity + parseInt(quantity);

    // Recheck stock with new quantity
    if (productVariant.quantity < newQuantity) {
      throw new ApiError(400, "Not enough stock available");
    }

    cartItem = await prisma.cartItem.update({
      where: {
        id: existingCartItem.id,
      },
      data: {
        quantity: newQuantity,
      },
      include: {
        productVariant: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
            flavor: true,
            weight: true,
          },
        },
      },
    });
  } else {
    // Create new cart item
    cartItem = await prisma.cartItem.create({
      data: {
        userId,
        productVariantId,
        quantity: parseInt(quantity),
      },
      include: {
        productVariant: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
            flavor: true,
            weight: true,
          },
        },
      },
    });
  }

  return res
    .status(200)
    .json(new ApiResponsive(200, cartItem, "Item added to cart successfully"));
});

// Update cart item quantity
export const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { cartItemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1");
  }

  // Check if cart item exists and belongs to user
  const existingCartItem = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      userId,
    },
    include: {
      productVariant: true,
    },
  });

  if (!existingCartItem) {
    throw new ApiError(404, "Cart item not found");
  }

  // Check stock availability
  if (existingCartItem.productVariant.quantity < quantity) {
    throw new ApiError(400, "Not enough stock available");
  }

  const updatedCartItem = await prisma.cartItem.update({
    where: {
      id: cartItemId,
    },
    data: {
      quantity: parseInt(quantity),
    },
    include: {
      productVariant: {
        include: {
          product: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
          flavor: true,
          weight: true,
        },
      },
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponsive(200, updatedCartItem, "Cart item updated successfully")
    );
});

// Remove item from cart
export const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { cartItemId } = req.params;

  // Check if cart item exists and belongs to user
  const existingCartItem = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      userId,
    },
  });

  if (!existingCartItem) {
    throw new ApiError(404, "Cart item not found");
  }

  await prisma.cartItem.delete({
    where: {
      id: cartItemId,
    },
  });

  return res
    .status(200)
    .json(new ApiResponsive(200, {}, "Item removed from cart successfully"));
});

// Clear cart
export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await prisma.cartItem.deleteMany({
    where: {
      userId,
    },
  });

  return res
    .status(200)
    .json(new ApiResponsive(200, {}, "Cart cleared successfully"));
});
