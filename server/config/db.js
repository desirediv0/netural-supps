import { PrismaClient } from "@prisma/client";

// Configure Prisma client with supported options
export const prisma = new PrismaClient({
  log: ["error", "warn"],
  // Define transaction timeout (available in Prisma Client)
  transactionOptions: {
    maxWait: 30000, // increased from 15000 - maximum time in ms to wait to acquire a transaction
    timeout: 120000, // increased from 60000 - maximum time in ms for the transaction to run
  },
});
