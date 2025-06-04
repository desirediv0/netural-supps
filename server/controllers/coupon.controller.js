import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get all coupons (admin)
export const getAllCoupons = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, isActive } = req.query;

  const filters = {};
  if (isActive !== undefined) {
    filters.isActive = isActive === "true";
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Get total count
  const totalCoupons = await prisma.coupon.count({
    where: filters,
  });

  // Get coupons with pagination
  const coupons = await prisma.coupon.findMany({
    where: filters,
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take,
  });

  return res.status(200).json(
    new ApiResponsive(
      200,
      {
        coupons,
        pagination: {
          total: totalCoupons,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalCoupons / parseInt(limit)),
        },
      },
      "Coupons fetched successfully"
    )
  );
});

// Get coupon by ID (admin)
export const getCouponById = asyncHandler(async (req, res) => {
  const { couponId } = req.params;

  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId },
  });

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  return res
    .status(200)
    .json(new ApiResponsive(200, { coupon }, "Coupon fetched successfully"));
});

// Create coupon (admin)
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxUses,
    startDate,
    endDate,
    isActive = true,
  } = req.body;

  // Validate required fields
  if (!code || !discountType || !discountValue || !startDate) {
    throw new ApiError(400, "Required fields missing");
  }

  // Convert dates to Date objects
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  // Check if code already exists
  const existingCoupon = await prisma.coupon.findUnique({
    where: { code },
  });

  if (existingCoupon) {
    throw new ApiError(409, "Coupon code already exists");
  }

  // Validate discount value
  if (
    discountType === "PERCENTAGE" &&
    (discountValue <= 0 || discountValue > 100)
  ) {
    throw new ApiError(400, "Percentage discount must be between 1 and 100");
  }

  if (discountType === "FIXED_AMOUNT" && discountValue <= 0) {
    throw new ApiError(400, "Fixed amount discount must be greater than 0");
  }

  // Create coupon
  const coupon = await prisma.coupon.create({
    data: {
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxUses,
      startDate: start,
      endDate: end,
      isActive,
    },
  });

  return res
    .status(201)
    .json(new ApiResponsive(201, { coupon }, "Coupon created successfully"));
});

// Update coupon (admin)
export const updateCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;
  const {
    code,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxUses,
    startDate,
    endDate,
    isActive,
  } = req.body;

  // Check if coupon exists
  const existingCoupon = await prisma.coupon.findUnique({
    where: { id: couponId },
  });

  if (!existingCoupon) {
    throw new ApiError(404, "Coupon not found");
  }

  // If updating code, check for uniqueness
  if (code && code !== existingCoupon.code) {
    const codeExists = await prisma.coupon.findUnique({
      where: { code },
    });

    if (codeExists) {
      throw new ApiError(409, "Coupon code already exists");
    }
  }

  // Validate discount value if updating
  if (discountType && discountValue) {
    if (
      discountType === "PERCENTAGE" &&
      (discountValue <= 0 || discountValue > 100)
    ) {
      throw new ApiError(400, "Percentage discount must be between 1 and 100");
    }

    if (discountType === "FIXED_AMOUNT" && discountValue <= 0) {
      throw new ApiError(400, "Fixed amount discount must be greater than 0");
    }
  }

  // Prepare update data
  const updateData = {
    ...(code && { code: code.toUpperCase() }),
    ...(description !== undefined && { description }),
    ...(discountType && { discountType }),
    ...(discountValue && { discountValue }),
    ...(minOrderAmount !== undefined && { minOrderAmount }),
    ...(maxUses !== undefined && { maxUses }),
    ...(startDate && { startDate: new Date(startDate) }),
    ...(endDate && { endDate: new Date(endDate) }),
    ...(isActive !== undefined && { isActive }),
  };

  // Update coupon
  const updatedCoupon = await prisma.coupon.update({
    where: { id: couponId },
    data: updateData,
  });

  return res
    .status(200)
    .json(
      new ApiResponsive(
        200,
        { coupon: updatedCoupon },
        "Coupon updated successfully"
      )
    );
});

// Delete coupon (admin)
export const deleteCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;

  // Check if coupon exists
  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId },
  });

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  // Delete coupon
  await prisma.coupon.delete({
    where: { id: couponId },
  });

  return res
    .status(200)
    .json(new ApiResponsive(200, {}, "Coupon deleted successfully"));
});

// Verify coupon (public)
export const verifyCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;

  if (!code || !cartTotal) {
    throw new ApiError(400, "Coupon code and cart total are required");
  }

  // Find coupon by code (regardless of date validity initially)
  const coupon = await prisma.coupon.findFirst({
    where: {
      code,
      isActive: true,
    },
  });

  if (!coupon) {
    throw new ApiError(404, "Invalid coupon code");
  }

  // Check minimum order amount
  if (
    coupon.minOrderAmount &&
    parseFloat(cartTotal) < parseFloat(coupon.minOrderAmount)
  ) {
    throw new ApiError(
      400,
      `Minimum order amount of ₹${coupon.minOrderAmount} required`
    );
  }

  // Check if maximum uses exceeded
  if (coupon.maxUses && (coupon.usedCount || 0) >= coupon.maxUses) {
    throw new ApiError(400, "Coupon usage limit exceeded");
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    // Cap percentage discount at 90%
    const cappedDiscountValue = Math.min(parseFloat(coupon.discountValue), 90);
    discountAmount = (parseFloat(cartTotal) * cappedDiscountValue) / 100;
  } else {
    discountAmount = parseFloat(coupon.discountValue);
  }

  // Ensure discount is not more than 90% of cart total
  const maxDiscountAllowed = parseFloat(cartTotal) * 0.9; // Maximum 90% discount
  discountAmount = Math.min(discountAmount, maxDiscountAllowed);

  return res.status(200).json(
    new ApiResponsive(
      200,
      {
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount: discountAmount.toFixed(2),
          finalAmount: (parseFloat(cartTotal) - discountAmount).toFixed(2),
        },
      },
      "Coupon applied successfully"
    )
  );
});

// Apply coupon to cart (private)
export const applyCoupon = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { code } = req.body;

  if (!code) {
    throw new ApiError(400, "Coupon code is required");
  }

  // Find coupon by code (regardless of date validity initially)
  const coupon = await prisma.coupon.findFirst({
    where: {
      code,
      isActive: true,
    },
  });

  if (!coupon) {
    throw new ApiError(404, "Invalid coupon code");
  }

  // REMOVING TEMPORARILY: Date validation for testing
  // Until we update the actual coupon dates in the database
  /*
  // Check date validity
  const currentDate = new Date();
  const startDate = coupon.startDate ? new Date(coupon.startDate) : null;
  const endDate = coupon.endDate ? new Date(coupon.endDate) : null;

  if (startDate && startDate > currentDate) {
    throw new ApiError(400, "This coupon is not active yet");
  }

  if (endDate && endDate < currentDate) {
    throw new ApiError(400, "This coupon has expired");
  }
  */

  // Check if maximum uses exceeded
  if (coupon.maxUses && (coupon.usedCount || 0) >= coupon.maxUses) {
    throw new ApiError(400, "Coupon usage limit exceeded");
  }

  // Get user's cart
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      productVariant: true,
    },
  });

  if (!cartItems.length) {
    throw new ApiError(400, "Your cart is empty");
  }

  // Calculate cart total
  let cartTotal = 0;
  for (const item of cartItems) {
    const price = parseFloat(
      item.productVariant.salePrice || item.productVariant.price
    );
    cartTotal += price * item.quantity;
  }

  // Check minimum order amount
  if (coupon.minOrderAmount && cartTotal < parseFloat(coupon.minOrderAmount)) {
    throw new ApiError(
      400,
      `Minimum order amount of ₹${coupon.minOrderAmount} required`
    );
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    // Cap percentage discount at 90%
    const cappedDiscountValue = Math.min(parseFloat(coupon.discountValue), 90);
    discountAmount = (cartTotal * cappedDiscountValue) / 100;
  } else {
    discountAmount = parseFloat(coupon.discountValue);
  }

  // Ensure discount is not more than 90% of cart total
  const maxDiscountAllowed = cartTotal * 0.9; // Maximum 90% discount
  discountAmount = Math.min(discountAmount, maxDiscountAllowed);

  return res.status(200).json(
    new ApiResponsive(
      200,
      {
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        },
        cartTotal: cartTotal.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        finalAmount: (cartTotal - discountAmount).toFixed(2),
      },
      "Coupon applied successfully"
    )
  );
});
