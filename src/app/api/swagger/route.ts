import { NextResponse } from "next/server";
import swaggerSpec from "../../swagger/swaggerConfig";

export async function GET() {
  return NextResponse.json(swaggerSpec);
}
