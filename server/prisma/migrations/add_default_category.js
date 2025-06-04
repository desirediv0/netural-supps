import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting migration to add default Uncategorized category");

  // Check if default category already exists by name
  const existingDefault = await prisma.category.findFirst({
    where: { name: "Uncategorized" },
  });

  if (existingDefault) {
    console.log("Default category already exists:", existingDefault);
    return;
  }

  // Create the default Uncategorized category with special description
  const defaultCategory = await prisma.category.create({
    data: {
      name: "Uncategorized",
      slug: "uncategorized",
      description: "DEFAULT_CATEGORY - Products without a specific category",
    },
  });

  console.log("Default category created:", defaultCategory);
}

main()
  .catch((e) => {
    console.error("Error in migration:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
