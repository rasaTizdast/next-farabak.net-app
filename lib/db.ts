import sql from "mssql";

const config = {
  user: (process.env.DB_USER as string) || throwError("DB_USER is not defined"),
  password:
    (process.env.DB_PASSWORD as string) ||
    throwError("DB_PASSWORD is not defined"),
  server:
    (process.env.DB_SERVER as string) || throwError("DB_SERVER is not defined"),
  database:
    (process.env.DB_DATABASE as string) ||
    throwError("DB_DATABASE is not defined"),
  port: Number(process.env.DB_PORT) || 1433, // Default to port 1433 if not specified
  options: {
    encrypt: false,
    trustServerCertificate: process.env.TRUST_SERVER_CERT === "true",
  },
};

// Helper function to throw an error if an environment variable is missing
function throwError(message: string): never {
  throw new Error(message);
}

// Function to connect to the database
export async function connectToDatabase() {
  try {
    return await sql.connect(config);
  } catch (err) {
    throw err;
  }
}
