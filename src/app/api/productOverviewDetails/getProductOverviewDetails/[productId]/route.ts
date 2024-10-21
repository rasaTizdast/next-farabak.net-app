import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/db";

/**
 * @swagger
 * /api/productOverviewDetails/getProductOverviewDetails/{productId}:
 *   get:
 *     summary: Retrieve detailed product overview by product ID
 *     description: Fetches product overview details including titles, descriptions, and images for a given product ID.
 *     tags: [ProductOverviewDetails]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: The ID of the product to get detailed overview for
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detailed product overview retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   productOverviewDetailsId:
 *                     type: integer
 *                     description: Unique ID of the product overview details
 *                   productName:
 *                     type: string
 *                     description: Name of the product
 *                   productId:
 *                     type: integer
 *                     description: ID of the product
 *                   title1:
 *                     type: string
 *                     description: First title
 *                   description1:
 *                     type: string
 *                     description: First description
 *                   img1:
 *                     type: string
 *                     description: First image URL
 *                   title2:
 *                     type: string
 *                     description: Second title
 *                   description2:
 *                     type: string
 *                     description: Second description
 *                   img2:
 *                     type: string
 *                     description: Second image URL
 *                   title3:
 *                     type: string
 *                     description: Third title
 *                   description3:
 *                     type: string
 *                     description: Third description
 *                   img3:
 *                     type: string
 *                     description: Third image URL
 *                   title4:
 *                     type: string
 *                     description: Fourth title
 *                   description4:
 *                     type: string
 *                     description: Fourth description
 *                   img4:
 *                     type: string
 *                     description: Fourth image URL
 *                   title5:
 *                     type: string
 *                     description: Fifth title
 *                   description5:
 *                     type: string
 *                     description: Fifth description
 *                   img5:
 *                     type: string
 *                     description: Fifth image URL
 *                   title6:
 *                     type: string
 *                     description: Sixth title
 *                   description6:
 *                     type: string
 *                     description: Sixth description
 *                   img6:
 *                     type: string
 *                     description: Sixth image URL
 *                   title7:
 *                     type: string
 *                     description: Seventh title
 *                   description7:
 *                     type: string
 *                     description: Seventh description
 *                   img7:
 *                     type: string
 *                     description: Seventh image URL
 *                   title8:
 *                     type: string
 *                     description: Eighth title
 *                   description8:
 *                     type: string
 *                     description: Eighth description
 *                   img8:
 *                     type: string
 *                     description: Eighth image URL
 *       404:
 *         description: No product found for the given ID
 *       500:
 *         description: Internal server error
 */

// Handler function for GET request
export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    // Connect to the database
    const pool = await connectToDatabase();

    // Query to get product overview details by product ID
    const result = await pool.request().input("ProductId", params.productId)
      .query(`
        SELECT 
          productOverviewDetailsId,
          productName,
          title1,
          description1,
          img1,
          title2,
          description2,
          img2,
          title3,
          description3,
          img3,
          title4,
          description4,
          img4,
          title5,
          description5,
          img5,
          title6,
          description6,
          img6,
          title7,
          description7,
          img7,
          title8,
          description8,
          img8,
          productId
        FROM Support.ProductOverviewDetails
        WHERE productId = @ProductId
      `);

    // If no matching product found, return a "No product found" message
    if (result.recordset.length === 0) {
      return NextResponse.json(
        { message: "No product found for the given ID" },
        { status: 404 }
      );
    }

    // Return the product overview details as a JSON response
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("Error fetching product overview details: ", error);

    // Return a server error response
    return new NextResponse("Failed to fetch product overview details", {
      status: 500,
    });
  }
}
