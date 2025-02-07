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
  productBlog: string;
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
export const createProduct = async (
  state: State,
  setProgress: (p: number) => void,
  setCurrentStep: (s: number) => void
) => {
  try {
    setCurrentStep(1);
    setProgress(10);

    // Step 1: Create the product in the database
    const productPayload = {
      Type: state.name,
      Slug: state.slug,
      Description: state.keywords,
      CategoryId: state.categoryID,
      CategoryContentId: state.subCategoryID,
      Available: state.available,
      Price: state.price.toString(),
      Discount: state.discount.toString(),
      Name: state.smallDesc,
      SEO_Title: state.SEO_Title || state.name,
      SEO_Description: state.SEO_Description || state.smallDesc,
      productBlog: state.productBlog,
    };
    const productResponse = await axios.post(
      "/api/admin/products/createNewProduct",
      productPayload
    );
    const productId = productResponse.data.ProductId;

    if (!productId) {
      throw new Error("Product creation failed: No product ID returned");
    }
    setProgress(30);

    // Step 2: Upload images to S3
    setCurrentStep(2);
    const [img1, img2] = await Promise.all([
      ImageUploader(state.transparentImage, state.slug, "mini"),
      ImageUploader(state.bannerImage, state.slug, "banner"),
    ]);
    setProgress(50);

    // Step 3: Update the product with image keys
    await axios.patch(`/api/admin/products/${productId}/updateImages`, {
      img1,
      img2,
    });

    // Step 4: Send additional details
    setCurrentStep(3);
    await sendOverviews(productId, state.name, state.features);
    setProgress(60);

    setCurrentStep(4);
    await sendOverviewDetails(productId, state.name, state.overviewDetails);
    setProgress(70);

    setCurrentStep(5);
    await sendSpecs(productId, state.name, state.specs);
    setProgress(80);

    setCurrentStep(6);
    await sendFaqs(productId, state.faqs);
    setProgress(90);

    setCurrentStep(7);
    setProgress(100);

    return productResponse.data;
  } catch (error) {
    throw new Error("Product creation failed");
  }
};
