import { NextResponse } from "next/server";
import swaggerSpec from "../../swagger/swaggerConfig";

export async function GET() {
  // Prevent serving the Swagger spec in production
  // if (process.env.NODE_ENV === "production") {
  //   return NextResponse.json({}, { status: 404 }); // Return 404 or an empty response
  // }

  // Serve the Swagger spec in development
  return NextResponse.json(swaggerSpec);
}
