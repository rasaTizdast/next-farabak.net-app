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

// Utility function for retrying API requests
const retryRequest = async <T,>(
  requestFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      console.error(
        `Attempt ${attempt} failed | تلاش ${attempt} ناموفق بود:`,
        error
      );

      if (attempt < maxRetries) {
        // Wait with exponential backoff before retrying
        const waitTime = delay * Math.pow(2, attempt - 1);
        console.log(
          `Retrying in ${waitTime}ms... | در حال تلاش مجدد در ${waitTime} میلی‌ثانیه...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw (
    lastError ||
    new Error("All retry attempts failed | تمام تلاش‌های مجدد ناموفق بودند")
  );
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

  return await retryRequest(async () => {
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
  });
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

  return await retryRequest(async () => {
    return await axios.post("/api/productOverview", payload);
  });
};

// Function to send specifications data to the API
const sendSpecs = async (
  ProductId: number,
  Name: string,
  specs: State["specs"]
) => {
  if (!specs || !specs.length) {
    console.log("No specs to send");
    return;
  } // Skip if no specs are provided

  try {
    const payload = specs.map((spec) => ({
      Name,
      Title: spec.title,
      Description: spec.description,
      ProductId,
      Available: true,
    }));

    console.log("Sending specs payload:", payload);

    return await retryRequest(async () => {
      const response = await axios.post("/api/specs", payload);
      console.log("Specs API response:", response.data);
      return response;
    });
  } catch (error) {
    console.error("Error sending specs:", error);
    throw error; // Re-throw to handle in the main function
  }
};

// Function to send FAQs data to the API
const sendFaqs = async (productId: number, faqs: State["faqs"]) => {
  if (!faqs || !faqs.length) {
    console.log("No FAQs to send");
    return;
  } // Skip if no FAQs are provided

  try {
    const payload = faqs.map((faq) => ({
      Title: faq.question, // Maps to 'Title'
      Description: faq.answer, // Maps to 'Description'
      ProductId: productId,
      Available: true,
      FilesAddress: "", // Set as empty since it's not part of incoming data
    }));

    console.log("Sending FAQs payload:", payload);

    return await retryRequest(async () => {
      const response = await axios.post("/api/faqs", payload);
      console.log("FAQs API response:", response.data);
      return response;
    });
  } catch (error) {
    console.error("Error sending FAQs:", error);
    throw error; // Re-throw to handle in the main function
  }
};

// Function to send overview details to the API
const sendOverviewDetails = async (
  productId: number,
  productName: string,
  overviewDetailsIds: number[] // Adjusted to accept only selected IDs
) => {
  if (!overviewDetailsIds || !overviewDetailsIds.length) {
    console.log("No overview details to send");
    return;
  } // Skip if no overview details are selected

  try {
    const payload = overviewDetailsIds.map((id) => ({
      ProductOverviewDetailsId: id,
      ProductName: productName,
      ProductId: productId,
    }));

    console.log("Sending overview details payload:", payload);

    return await retryRequest(async () => {
      const response = await axios.post("/api/productOverviewDetails", payload);
      console.log("Overview details API response:", response.data);
      return response;
    });
  } catch (error) {
    console.error("Error sending overview details:", error);
    throw error; // Re-throw to handle in the main function
  }
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

    console.log("Creating product with payload:", productPayload);

    const productResponse = await retryRequest(async () => {
      return await axios.post(
        "/api/admin/products/createNewProduct",
        productPayload
      );
    });

    const productId = productResponse.data.ProductId;

    if (!productId) {
      throw new Error("ساخت محصول ناموفق بود: شناسه محصول دریافت نشد");
    }
    console.log("Product created successfully with ID:", productId);
    setProgress(30);

    // Step 2: Upload images to S3
    setCurrentStep(2);
    console.log("Uploading images...");
    const [img1, img2] = await Promise.all([
      ImageUploader(state.transparentImage, state.slug, "mini"),
      ImageUploader(state.bannerImage, state.slug, "banner"),
    ]);
    console.log("Images uploaded successfully:", {
      transparentImage: img1,
      bannerImage: img2,
    });
    setProgress(50);

    // Step 3: Update the product with image keys
    console.log("Updating product with image keys...");
    await retryRequest(async () => {
      await axios.patch(`/api/admin/products/${productId}/updateImages`, {
        img1,
        img2,
      });
    });
    console.log("Product updated with image keys successfully");

    // Step 4: Send additional details - wrap each in try/catch to prevent one failure from stopping others
    try {
      setCurrentStep(3);
      console.log("Sending product overview features...");
      await sendOverviews(productId, state.name, state.features);
      setProgress(60);
    } catch (error) {
      console.error(
        "Failed to send product features, continuing with other steps:",
        error
      );
    }

    try {
      setCurrentStep(4);
      console.log("Sending product overview details...");
      await sendOverviewDetails(productId, state.name, state.overviewDetails);
      setProgress(70);
    } catch (error) {
      console.error(
        "Failed to send overview details, continuing with other steps:",
        error
      );
    }

    try {
      setCurrentStep(5);
      console.log("Sending product specifications...");
      await sendSpecs(productId, state.name, state.specs);
      setProgress(80);
    } catch (error) {
      console.error(
        "Failed to send specs, continuing with other steps:",
        error
      );
    }

    try {
      setCurrentStep(6);
      console.log("Sending product FAQs...");
      await sendFaqs(productId, state.faqs);
      setProgress(90);
    } catch (error) {
      console.error("Failed to send FAQs, continuing with other steps:", error);
    }

    setCurrentStep(7);
    setProgress(100);

    return productResponse.data;
  } catch (error) {
    console.error("خطا در ایجاد محصول:", error);
    throw error; // Let the caller handle the error
  }
};
