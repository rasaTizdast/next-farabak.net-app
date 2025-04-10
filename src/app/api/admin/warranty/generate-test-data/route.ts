import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to verify the JWT token
async function verifyCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get("accessToken")?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    console.log("[API] Token payload:", payload);
    return {
      id: payload.userId as string,
      role: payload.role as string,
      branchId: payload.branchId as number
    };
  } catch (error) {
    console.error("[API] ❌ Token verification failed:", error);
    return null;
  }
}

// Generate random string for warranty code
function generateRandomCode() {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

// Generate dates for warranty
function generateDates(status: string) {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 30); // Start date is 30 days ago
  
  const expiryDate = new Date(now);
  
  if (status === 'Active') {
    // For active warranties, set expiry date in the future
    expiryDate.setDate(expiryDate.getDate() + 90); // Expires in 90 days
  } else if (status === 'Expired') {
    // For expired warranties, set expiry date in the past
    expiryDate.setDate(expiryDate.getDate() - 10); // Expired 10 days ago
  } else {
    // For requested warranties (or any other status), set a random expiry
    // that could be past or future
    const days = Math.floor(Math.random() * 180) - 90; // Random between -90 and +90 days
    expiryDate.setDate(expiryDate.getDate() + days);
  }
  
  return {
    startDate: startDate.toISOString(),
    expiryDate: expiryDate.toISOString()
  };
}

export async function POST(req: NextRequest) {
  console.log("[API] 🏭 Generate test warranty data API hit");
  try {
    // Verify user
    const currentUser = await verifyCurrentUser();
    
    if (!currentUser) {
      console.log("[API] ❌ No authentication found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    if (currentUser.role !== "Admin" && currentUser.role !== "Branch") {
      console.log(`[API] ❌ Unauthorized role: ${currentUser.role}`);
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { count = 5, status = 'Requested' } = body;
    
    console.log(`[API] 📝 Generating ${count} test warranty records with status ${status}`);
    
    // Validate count
    if (typeof count !== 'number' || count < 1 || count > 50) {
      return NextResponse.json(
        { error: "Count must be between 1 and 50" },
        { status: 400 }
      );
    }
    
    // Validate status
    const validStatuses = ['Active', 'Expired', 'Requested'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Status must be one of: Active, Expired, Requested" },
        { status: 400 }
      );
    }
    
    // First, get the branch ID for the current user
    let branchId;
    
    if (currentUser.role === 'Branch') {
      // For branch users, get their branch
      const branch = await prisma.branch.findFirst({
        where: {
          UserID: parseInt(currentUser.id)
        }
      });
      
      if (!branch) {
        return NextResponse.json(
          { error: "No branch found for the current user" },
          { status: 404 }
        );
      }
      
      branchId = branch.branchid;
    } else {
      // For admin users, get the first available branch
      const branch = await prisma.branch.findFirst();
      
      if (!branch) {
        return NextResponse.json(
          { error: "No branches found in the system" },
          { status: 404 }
        );
      }
      
      branchId = branch.branchid;
    }
    
    console.log(`[API] 📦 Using branch ID: ${branchId}`);
    
    // Get a product to use for test data
    const product = await prisma.product.findFirst();
    
    if (!product) {
      return NextResponse.json(
        { error: "No products found in the system" },
        { status: 404 }
      );
    }
    
    console.log(`[API] 📦 Using product ID: ${product.ProductId}`);
    
    // Get or create test invoice and invoice details
    let invoice = await prisma.invoice.findFirst({
      where: {
        Fullname: "Test Customer"
      }
    });
    
    if (!invoice) {
      invoice = await prisma.invoice.create({
        data: {
          FactorGuid: `TEST-${Date.now()}`,
          Fullname: "Test Customer",
          Phonenumber: "09123456789",
          UserId: parseInt(currentUser.id),
          TotalAmount: 1000000,
          Checked: true,
          Date: new Date().toISOString()
        }
      });
    }
    
    console.log(`[API] 📦 Using invoice ID: ${invoice.Invoiceid}`);
    
    // Create invoice detail if needed
    let invoiceDetail = await prisma.invoice_Details.findFirst({
      where: {
        Invoiceid: invoice.Invoiceid
      }
    });
    
    if (!invoiceDetail) {
      invoiceDetail = await prisma.invoice_Details.create({
        data: {
          Invoiceid: invoice.Invoiceid,
          UserId: parseInt(currentUser.id),
          ProductId: product.ProductId,
          quantity: 1,
          price: 1000000,
          total_price: 1000000
        }
      });
    }
    
    console.log(`[API] 📦 Using invoice detail ID: ${invoiceDetail.Invoice_Details}`);
    
    // Generate test warranty records
    const warranties = [];
    
    for (let i = 0; i < count; i++) {
      const { startDate, expiryDate } = generateDates(status);
      
      try {
        const warranty = await prisma.warranty.create({
          data: {
            userid: parseInt(currentUser.id),
            invoicedetailid: invoiceDetail.Invoice_Details,
            branchid: branchId,
            warrantycode: `TEST-${generateRandomCode()}`,
            ProductId: product.ProductId,
            startdate: startDate,
            expirydate: expiryDate,
            status: status
          }
        });
        
        warranties.push(warranty);
      } catch (error) {
        console.error(`[API] ❌ Error creating warranty record #${i}:`, error);
      }
    }
    
    console.log(`[API] ✅ Successfully created ${warranties.length} test warranty records`);
    
    return NextResponse.json({
      message: `Successfully generated ${warranties.length} test warranty records with status '${status}'`,
      warranties: warranties
    });
  } catch (error) {
    console.error("[API] ❌ Error generating test data:", error);
    return NextResponse.json(
      { error: "Failed to generate test data" },
      { status: 500 }
    );
  }
} 