import axios from "axios";

// Define the state type for better type safety and structure
type State = {
  name: string;
  slug: string;
  keywords: string;
  categoryID: number | null;
  subCategoryID: string | null;
  available: boolean;
  price: number;
  discount: number;
  smallDesc: string;
  bannerImage: File | null;
  transparentImage: File | null;
  SEO_Title: string;
  SEO_Description: string;
  features: string[];
  overviewDetails: number[];
  specs: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
};

// Function to handle uploading images to S3
const ImageUploader = async (
  image: File | null,
  productName: string,
  imageType: "banner" | "mini"
) => {
  // Ensure that required data is available
  if (!image || !productName) {
    return;
  }

  try {
    // Request a presigned URL for image upload
    const response = await axios.post("/api/s3/upload", {
      type: "productImage",
      folderName: productName,
      contentType: image.type,
      imageType,
    });

    const { uploadUrl, key } = response.data;

    // Upload the image to the presigned URL
    await axios.put(uploadUrl, image, {
      headers: {
        "Content-Type": image.type,
      },
    });

    return key; // Return the image key for further use
  } catch (error) {
    throw new Error("Error uploading the image");
  }
};

// Function to send features data to the API
const sendOverviews = async (
  ProductId: number,
  ProductName: string,
  Features: string[]
) => {
  if (!Features.length) return; // Skip if no features are provided

  const payload = {
    ProductName,
    ProductId,
    Features, // Send the array of features
  };

  await axios.post("/api/productOverview", payload);
};

// Function to send overview details to the API
const sendOverviewDetails = async (
  productId: number,
  productName: string,
  overviewDetailsIds: number[] // Adjusted to accept only selected IDs
) => {
  if (!overviewDetailsIds.length) return; // Skip if no overview details are selected

  const payload = overviewDetailsIds.map((id) => ({
    ProductOverviewDetailsId: id,
    ProductName: productName,
    ProductId: productId,
  }));

  await axios.post("/api/productOverviewDetails", payload);
};

// Function to send specifications data to the API
const sendSpecs = async (
  ProductId: number,
  Name: string,
  specs: State["specs"]
) => {
  if (!specs.length) return; // Skip if no specs are provided

  const payload = specs.map((spec) => ({
    Name,
    Title: spec.title, // Match the database model
    Description: spec.description,
    ProductId,
    Available: true,
  }));

  await axios.post("/api/specs", payload);
};

// Function to send FAQs data to the API
const sendFaqs = async (productId: number, faqs: State["faqs"]) => {
  if (!faqs.length) return; // Skip if no FAQs are provided

  const payload = faqs.map((faq) => ({
    Title: faq.question, // Map 'question' to 'Title'
    Description: faq.answer, // Map 'answer' to 'Description'
    ProductId: productId,
    Available: true,
    FilesAddress: "", // Set as empty since it's not part of incoming data
  }));

  await axios.post("/api/faqs", payload);
};

// Main function to create a product and send all associated details
export const createProduct = async (state: State) => {
  try {
    const {
      name,
      slug,
      categoryID,
      subCategoryID,
      available,
      price,
      discount,
      smallDesc,
      transparentImage,
      bannerImage,
      SEO_Title,
      SEO_Description,
      features,
      overviewDetails,
      specs,
      faqs,
      keywords,
    } = state;

    const productName = slug;

    // Step 1: Create the product in the database
    const productPayload = {
      Type: name,
      Slug: slug,
      Description: keywords,
      CategoryId: categoryID,
      CategoryContentId: subCategoryID,
      Available: available,
      Price: price.toString(),
      Discount: discount.toString(),
      Name: smallDesc,
      SEO_Title: SEO_Title || name,
      SEO_Description: SEO_Description || smallDesc,
    };

    const productResponse = await axios.post(
      "/api/admin/products/createNewProduct",
      productPayload
    );

    const productId = productResponse.data.ProductId; // Retrieve the product ID

    if (!productId) {
      throw new Error("Product creation failed: No product ID returned");
    }

    // Step 2: Upload images to S3
    const [img1, img2] = await Promise.all([
      ImageUploader(transparentImage, productName, "mini"),
      ImageUploader(bannerImage, productName, "banner"),
    ]);
    // Step 3: Update the product with image keys
    const imageUpdatePayload = {
      img1,
      img2,
    };

    await axios.patch(
      `/api/admin/products/${productId}/updateImages`,
      imageUpdatePayload
    );
    // Step 4: Send additional details in parallel
    await Promise.all([
      sendOverviews(productId, name, features),
      sendOverviewDetails(productId, name, overviewDetails),
      sendSpecs(productId, name, specs),
      sendFaqs(productId, faqs),
    ]);
    return productResponse.data; // Return the product response
  } catch (error) {
    throw new Error("Product creation failed");
  }
};
