import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { doUploadImage, handleProductImageUpdate } from "../ProductImageUpload";

vi.mock("axios", () => ({ default: { put: vi.fn() } }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn(), error: vi.fn() } }));

describe("product image replacement", () => {
  const file = new File(["image"], "mini.png", { type: "image/png" });

  beforeEach(() => vi.clearAllMocks());

  it("does not delete the existing image before attempting a replacement upload", async () => {
    const deleteImage = vi.fn();
    const uploadImage = vi.fn().mockResolvedValue(null);

    await expect(
      handleProductImageUpdate(1, "product", file, null, deleteImage, uploadImage)
    ).rejects.toThrow();

    expect(deleteImage).not.toHaveBeenCalled();
  });

  it("returns the uploaded replacement key without deleting a same-key overwrite", async () => {
    const deleteImage = vi.fn();
    const uploadImage = vi.fn().mockResolvedValue("product/product-mini.png");

    const result = await handleProductImageUpdate(
      1,
      "product",
      file,
      null,
      deleteImage,
      uploadImage
    );

    expect(result).toEqual({ img1: "product/product-mini.png" });
    expect(deleteImage).not.toHaveBeenCalled();
  });

  it("rejects a failed PUT instead of allowing a successful product save", async () => {
    vi.mocked(axios.put).mockRejectedValue(new Error("Upload failed"));
    const signUpload = vi
      .fn()
      .mockResolvedValue({ uploadUrl: "https://storage.test/upload", key: "product/mini.png" });

    await expect(doUploadImage(file, "product", "mini", signUpload)).rejects.toThrow();
  });
});
