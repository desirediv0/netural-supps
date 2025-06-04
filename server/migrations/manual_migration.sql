-- Add couponId field to Order table
ALTER TABLE "Order" ADD COLUMN "couponId" TEXT;

-- Add foreign key constraint to Order table 
ALTER TABLE "Order" ADD CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create UserCoupon table if it doesn't exist
CREATE TABLE IF NOT EXISTS "UserCoupon" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "couponId" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "UserCoupon_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint to UserCoupon
ALTER TABLE "UserCoupon" ADD CONSTRAINT "UserCoupon_userId_couponId_key" UNIQUE ("userId", "couponId");

-- Add foreign key constraints to UserCoupon
ALTER TABLE "UserCoupon" ADD CONSTRAINT "UserCoupon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserCoupon" ADD CONSTRAINT "UserCoupon_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add isDiscountCapped field to Coupon if it doesn't exist
ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "isDiscountCapped" BOOLEAN NOT NULL DEFAULT false; 