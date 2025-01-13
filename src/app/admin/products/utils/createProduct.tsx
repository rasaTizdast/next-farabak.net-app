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
  bannerImage: File;
  transparentImage: File;
  SEO_Title: string;
  SEO_Description: string;
  features: string[];
  overviewDetails: {
    ProductOverviewDetailsId: number;
    Title: string;
    Img: string;
    Description: string;
    selected: boolean; // Indicates if this overview detail is selected
  }[];
  specs: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
};

// Function to handle uploading images to S3
const ImageUploader = async (
  image: File,
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
  productId: number,
  productName: string,
  features: string[]
) => {
  if (!features.length) return; // Skip if no features are provided

  const payload = features.map((feature, index) => ({
    ProductName: productName,
    ProductId: productId,
    [`Property${index + 1}`]: feature, // Dynamically create property names
    Available: true,
  }));

  await axios.post("/api/productOverview", payload);
};

// Function to send overview details to the API
const sendOverviewDetails = async (
  productId: number,
  productName: string,
  overviewDetails: State["overviewDetails"]
) => {
  if (!overviewDetails.length) return; // Skip if no overview details are provided

  const payload = overviewDetails.map((detail) => ({
    ProductOverviewDetailsId: detail.ProductOverviewDetailsId,
    ProductName: productName,
    ProductId: productId,
    Title: detail.Title,
    Img: detail.Img,
    Description: detail.Description,
    selected: detail.selected,
  }));

  await axios.post("/api/overviewDetails", payload);
};

// Function to send specifications data to the API
const sendSpecs = async (productId: number, specs: State["specs"]) => {
  if (!specs.length) return; // Skip if no specs are provided

  const payload = specs.map((spec) => ({
    Name: spec.title,
    Description: spec.description,
    ProductId: productId,
    Available: true,
  }));

  await axios.post("/api/specs", payload);
};

// Function to send FAQs data to the API
const sendFaqs = async (productId: number, faqs: State["faqs"]) => {
  if (!faqs.length) return; // Skip if no FAQs are provided

  const payload = faqs.map((faq) => ({
    Question: faq.question,
    Answer: faq.answer,
    ProductId: productId,
    Available: true,
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

    // Step 1: Upload images to S3
    const [img1, img2] = await Promise.all([
      ImageUploader(transparentImage, productName, "mini"),
      ImageUploader(bannerImage, productName, "banner"),
    ]);

    // Step 2: Prepare and send product creation payload
    const productPayload = {
      Type: name,
      Slug: slug,
      Description: keywords,
      CategoryId: categoryID,
      CategoryContentId: subCategoryID,
      Available: available,
      Price: price,
      Discount: discount,
      Name: smallDesc,
      img1,
      img2,
      SEO_Title: SEO_Title || name,
      SEO_Description: SEO_Description || smallDesc,
    };

    const productResponse = await axios.post(
      "/api/admin/products/createNewProduct",
      productPayload
    );
    const productId = productResponse.data.id; // Retrieve the product ID

    // Step 3: Send additional details in parallel
    await Promise.all([
      sendOverviews(productId, name, features),
      sendOverviewDetails(productId, name, overviewDetails),
      sendSpecs(productId, specs),
      sendFaqs(productId, faqs),
    ]);

    console.log("Product created successfully with all details");
    return productResponse.data; // Return the product response
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Product creation failed");
  }
};
