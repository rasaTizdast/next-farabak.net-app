import { Prisma } from "@prisma/client";

const CONNECTION_CODES = new Set(["P1000", "P1001", "P1002", "P1008", "P1017"]);

/** An unavailable datasource is recoverable; schema and query bugs are not. */
export function isPrismaConnectivityError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return CONNECTION_CODES.has(error.code);
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    if (error.errorCode) return CONNECTION_CODES.has(error.errorCode);

    // Some Prisma adapters omit P1000/P1001 on authentication/connection errors.
    return /(?:authentication failed against database server|can't reach database server|timed out)/i.test(
      error.message
    );
  }

  return false;
}
