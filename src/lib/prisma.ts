import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    // Critical configuration for connection management
    datasourceUrl: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Ensure connection on startup
if (!globalForPrisma.prisma) {
  prisma
    .$connect()
    .then(() => {
      console.log("✅ Prisma connected successfully");
    })
    .catch((error) => {
      console.error("❌ Prisma connection failed:", error);
      process.exit(1);
    });
}

// Enhanced graceful shutdown
const cleanup = async () => {
  console.log("🔌 Disconnecting Prisma...");
  try {
    await prisma.$disconnect();
    console.log("✅ Prisma disconnected");
  } catch (error) {
    console.error("❌ Error disconnecting Prisma:", error);
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("SIGQUIT", cleanup);

// Handle unexpected exits
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

// Handle uncaught errors
process.on("uncaughtException", async (error) => {
  console.error("Uncaught Exception:", error);
  await prisma.$disconnect();
  process.exit(1);
});

process.on("unhandledRejection", async (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  await prisma.$disconnect();
  process.exit(1);
});
