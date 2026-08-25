import axios from "axios";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { createProduct } from "../createProduct";

vi.mock("axios");
const mockAxiosPost = vi.mocked(axios.post);
const mockAxiosPut = vi.mocked(axios.put);
const mockAxiosPatch = vi.mocked(axios.patch);

const validState = {
  name: "Test Product",
  slug: "test-product",
  keywords: "test, product",
  categoryID: 1,
  subCategoryID: "10",
  available: true,
  price: 100000,
  discount: 10000,
  smallDesc: "A test product description",
  bannerImage: new File(["banner"], "banner.jpg", { type: "image/jpeg" }),
  transparentImage: new File(["transparent"], "transparent.png", { type: "image/png" }),
  SEO_Title: "Test Product SEO",
  SEO_Description: "Test product SEO description",
  productBlog: "<p>Blog content</p>",
  features: ["Feature 1", "Feature 2"],
  overviewDetails: [1, 2],
  specs: [{ title: "Spec 1", description: "Spec 1 Description" }],
  faqs: [{ question: "What is this?", answer: "A test product" }],
};

describe("createProduct", () => {
  const mockSetProgress = vi.fn();
  const mockSetCurrentStep = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("successfully creates a product through all steps", async () => {
    // Step 1: Create product
    mockAxiosPost.mockImplementationOnce(async (url: string) => {
      if (url === "/api/admin/products/createNewProduct") {
        return { data: { ProductId: 999 } };
      }
      return { data: {} };
    });

    // Step 2: S3 upload (presigned URL)
    mockAxiosPost.mockImplementationOnce(async (url: string) => {
      if (url === "/api/s3/upload") {
        return { data: { uploadUrl: "https://s3.example.com/upload", key: "images/test-key" } };
      }
      return { data: {} };
    });

    mockAxiosPost.mockImplementationOnce(async (url: string) => {
      if (url === "/api/s3/upload") {
        return { data: { uploadUrl: "https://s3.example.com/upload2", key: "images/test-key2" } };
      }
      return { data: {} };
    });

    // S3 PUT uploads
    mockAxiosPut.mockResolvedValue({ status: 200 });

    // Step 3: Update images
    mockAxiosPatch.mockResolvedValue({ status: 200 });

    // Steps 4-7: Features, overview details, specs, FAQs
    mockAxiosPost.mockImplementation(async () => {
      return { data: { success: true } };
    });

    const result = await createProduct(validState, mockSetProgress, mockSetCurrentStep);

    expect(result).toBeDefined();
    expect(result.ProductId).toBe(999);
    expect(mockSetProgress).toHaveBeenCalledWith(100);
    expect(mockSetCurrentStep).toHaveBeenCalledWith(7);
  });

  it("throws error when product creation fails", async () => {
    mockAxiosPost.mockRejectedValue(new Error("Server error"));

    const promise = createProduct(validState, mockSetProgress, mockSetCurrentStep);
    const rejection = expect(promise).rejects.toThrow("Server error");
    await vi.advanceTimersByTimeAsync(10000);
    await rejection;
  });

  it("throws error when no ProductId is returned", async () => {
    mockAxiosPost.mockResolvedValueOnce({ data: {} });

    await expect(createProduct(validState, mockSetProgress, mockSetCurrentStep)).rejects.toThrow(
      "ساخت محصول ناموفق بود"
    );
  });

  it("continues even if features step fails", async () => {
    // Step 1: Create product
    mockAxiosPost.mockResolvedValueOnce({ data: { ProductId: 999 } });

    // Step 2: S3 uploads
    mockAxiosPost.mockResolvedValueOnce({ data: { uploadUrl: "url1", key: "key1" } });
    mockAxiosPost.mockResolvedValueOnce({ data: { uploadUrl: "url2", key: "key2" } });
    mockAxiosPut.mockResolvedValue({ status: 200 });

    // Step 3: Update images
    mockAxiosPatch.mockResolvedValue({ status: 200 });

    // Step 4: Features fails
    mockAxiosPost.mockRejectedValueOnce(new Error("Features API error"));

    // Steps 5-7 succeed
    mockAxiosPost.mockResolvedValue({ data: { success: true } });

    const result = await createProduct(validState, mockSetProgress, mockSetCurrentStep);

    expect(result).toBeDefined();
    expect(result.ProductId).toBe(999);
  });

  it("builds correct product payload", async () => {
    mockAxiosPost.mockResolvedValueOnce({ data: { ProductId: 1 } });
    mockAxiosPost.mockResolvedValue({ data: {} });
    mockAxiosPut.mockResolvedValue({ status: 200 });
    mockAxiosPatch.mockResolvedValue({ status: 200 });

    await createProduct(validState, mockSetProgress, mockSetCurrentStep);

    const createCall = mockAxiosPost.mock.calls.find(
      (call) => call[0] === "/api/admin/products/createNewProduct"
    );

    expect(createCall).toBeDefined();
    const payload = createCall![1] as any;
    expect(payload.Type).toBe("Test Product");
    expect(payload.Slug).toBe("test-product");
    expect(payload.Price).toBe("100000");
    expect(payload.Discount).toBe("10000");
    expect(payload.CategoryId).toBe(1);
    expect(payload.Available).toBe(true);
    expect(payload.SEO_Title).toBe("Test Product SEO");
  });

  it("skips steps with empty arrays", async () => {
    const stateWithNoArrays = {
      ...validState,
      features: [],
      overviewDetails: [],
      specs: [],
      faqs: [],
    };

    mockAxiosPost.mockResolvedValueOnce({ data: { ProductId: 1 } });
    mockAxiosPost.mockResolvedValue({ data: {} });
    mockAxiosPut.mockResolvedValue({ status: 200 });
    mockAxiosPatch.mockResolvedValue({ status: 200 });

    const result = await createProduct(stateWithNoArrays, mockSetProgress, mockSetCurrentStep);

    expect(result).toBeDefined();
    // Should not have called productOverview, specs, faqs endpoints
    const overviewCall = mockAxiosPost.mock.calls.find(
      (call) => call[0] === "/api/productOverview"
    );
    const specsCall = mockAxiosPost.mock.calls.find((call) => call[0] === "/api/specs");
    const faqsCall = mockAxiosPost.mock.calls.find((call) => call[0] === "/api/faqs");

    expect(overviewCall).toBeUndefined();
    expect(specsCall).toBeUndefined();
    expect(faqsCall).toBeUndefined();
  });

  it("skips image upload when images are null", async () => {
    const stateNoImages = {
      ...validState,
      bannerImage: null,
      transparentImage: null,
    };

    mockAxiosPost.mockResolvedValueOnce({ data: { ProductId: 1 } });
    mockAxiosPost.mockResolvedValue({ data: {} });
    mockAxiosPatch.mockResolvedValue({ status: 200 });

    const result = await createProduct(stateNoImages, mockSetProgress, mockSetCurrentStep);

    expect(result).toBeDefined();
    // No S3 upload calls should be made
    const s3Calls = mockAxiosPost.mock.calls.filter((call) => call[0] === "/api/s3/upload");
    expect(s3Calls).toHaveLength(0);
  });
});
