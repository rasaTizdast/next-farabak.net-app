import axios from "axios";

export async function doUploadImage(
  image: File | null,
  productName: string,
  imageType: "banner" | "mini",
  postMutation: { mutate: (url: string, body: any) => Promise<any> }
) {
  if (!image || !productName) {
    return null;
  }

  const response = await postMutation.mutate("/api/s3/upload", {
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