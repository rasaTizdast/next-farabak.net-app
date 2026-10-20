import axios from "axios";

export type S3UploadBody = {
  type: string;
  folderName: string;
  contentType: string;
  imageType: string;
};

export type S3UploadResponse = {
  uploadUrl: string;
  key: string;
};

export type S3DeleteBody = {
  productId: number;
  type: string;
  productImageType: string;
};

export type S3DeleteResponse = unknown;

export type UploadMutateFn = (url: string, body: S3UploadBody) => Promise<S3UploadResponse | null>;
export type DeleteMutateFn = (url: string, body: S3DeleteBody) => Promise<S3DeleteResponse | null>;

export async function doUploadImage(
  image: File | null,
  productName: string,
  imageType: "banner" | "mini",
  postMutation: UploadMutateFn
) {
  if (!image || !productName) {
    return null;
  }

  const response = await postMutation("/api/s3/upload", {
    type: "productImage",
    folderName: productName,
    contentType: image.type,
    imageType,
  });

  if (!response) throw new Error("دریافت مجوز آپلود تصویر ناموفق بود.");

  const { uploadUrl, key } = response;

  await axios.put(uploadUrl, image, {
    headers: {
      "Content-Type": image.type,
    },
  });

  return key;
}

export async function handleProductImageUpdate(
  _productId: number,
  productName: string,
  newImg1: File | null,
  newImg2: File | null,
  _deleteMutation: DeleteMutateFn,
  imageUploader: (
    image: File | null,
    productName: string,
    imageType: "banner" | "mini"
  ) => Promise<string | null>
): Promise<{ img1?: string; img2?: string }> {
  const payload: { img1?: string; img2?: string } = {};

  if (newImg1) {
    // The upload endpoint overwrites the deterministic image key. Deleting it
    // first loses the existing image when uploading fails.
    const img1Key = await imageUploader(newImg1, productName, "mini");
    if (!img1Key) throw new Error("آپلود تصویر بدون پس‌زمینه ناموفق بود.");
    payload.img1 = img1Key;
  }

  if (newImg2) {
    const img2Key = await imageUploader(newImg2, productName, "banner");
    if (!img2Key) throw new Error("آپلود تصویر بنر ناموفق بود.");
    payload.img2 = img2Key;
  }

  return payload;
}
