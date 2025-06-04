// jwtMiddleware.js
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../config/db.js";

export const verifyJWTToken = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers?.authorization?.replace("Bearer ", "") ||
      req.query?.accessToken;

    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    const decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ApiError(401, "Invalid token or user not found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);

    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid token");
    } else if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token expired");
    }
    throw new ApiError(500, "Authentication error", [error.message]);
  }
});

// Admin authentication middleware
export const isAdmin = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.adminToken ||
      req.headers?.authorization?.replace("Bearer ", "") ||
      req.query?.adminToken;

    if (!token) {
      throw new ApiError(401, "Admin authentication required");
    }

    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      include: {
        permissions: {
          select: {
            resource: true,
            action: true,
          },
        },
      },
    });

    if (!admin) {
      throw new ApiError(401, "Invalid token or admin not found");
    }

    if (!admin.isActive) {
      throw new ApiError(403, "Admin account is inactive");
    }

    // Map permissions for easier access
    const permissionsArray = admin.permissions.map(
      (p) => `${p.resource}:${p.action}`
    );

    // Add formatted permissions to the admin object
    admin.permissions = permissionsArray;

    // Attach admin to request
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid admin token");
    } else if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Admin token expired");
    }
    throw error;
  }
});

// Permission checking middleware
export const hasPermission = (resource, action) => {
  return asyncHandler(async (req, res, next) => {
    const admin = req.admin;

    if (!admin) {
      throw new ApiError(401, "Admin authentication required");
    }

    // Super admins have all permissions
    if (admin.role === "SUPER_ADMIN") {
      return next();
    }

    const hasAccess = admin.permissions.includes(`${resource}:${action}`);

    if (!hasAccess) {
      throw new ApiError(
        403,
        "You don't have permission to perform this action"
      );
    }

    next();
  });
};
