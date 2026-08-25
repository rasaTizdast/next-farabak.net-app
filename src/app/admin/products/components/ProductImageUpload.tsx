import axios from "axios";
import toast from "react-hot-toast";

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

  if (!response) return null;

  const { uploadUrl, key } = response;

  try {
    await axios.put(uploadUrl, image, {
      headers: {
        "Content-Type": image.type,
      },
    });
  } catch (error) {
    console.error(error);
    return null;
  }

  return key;
}

export async function handleProductImageUpdate(
  productId: number,
  productName: string,
  newImg1: File | null,
  newImg2: File | null,
  deleteMutation: DeleteMutateFn,
  imageUploader: (
    image: File | null,
    productName: string,
    imageType: "banner" | "mini"
  ) => Promise<string | null>
): Promise<{ img1?: string; img2?: string }> {
  const payload: { img1?: string; img2?: string } = {};

  if (newImg1) {
    const delete1Res = await deleteMutation("/api/s3/delete", {
      productId,
      type: "productImages",
      productImageType: "mini",
    });
    if (delete1Res !== null) {
      const img1Key = await imageUploader(newImg1, productName, "mini");
      if (!img1Key) {
        console.error("Failed to upload img1");
      } else {
        payload.img1 = img1Key;
        toast.success("تصویر بدون پس‌زمینه با موفقیت آپدیت شد!");
      }
    } else {
      toast.error("آپلود تصویر بدون پس‌زمینه با شکست مواجه شد، مجددا تلاش کنید");
    }
  }

  if (newImg2) {
    const delete2Res = await deleteMutation("/api/s3/delete", {
      productId,
      type: "productImages",
      productImageType: "banner",
    });
    if (delete2Res !== null) {
      const img2Key = await imageUploader(newImg2, productName, "banner");
      if (!img2Key) {
        console.error("Failed to upload img2");
      } else {
        payload.img2 = img2Key;
        toast.success("تصویر بنر با موفقیت آپدیت شد!");
      }
    } else {
      toast.error("آپدیت تصویر بنر با شکست مواجه شد، مجددا تلاش کنید");
    }
  }

  return payload;
}
