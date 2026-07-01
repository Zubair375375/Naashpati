import cloudinary from "cloudinary";

const IMAGE_UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || "naashpati";

const AGGRESSIVE_IMAGE_TRANSFORM = {
  fetch_format: "auto",
  quality: "auto:eco",
  dpr: "auto",
  width: 2000,
  crop: "limit",
  flags: "progressive:steep",
};

const getCloudinary = () => {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary.v2;
};

export const getCloudinaryImageUploadOptions = (
  folder = IMAGE_UPLOAD_FOLDER,
) => ({
  folder,
  resource_type: "image",
  eager: [AGGRESSIVE_IMAGE_TRANSFORM],
  eager_async: true,
});

export const buildOptimizedCloudinaryImageUrl = (publicId) => {
  if (!publicId) return "";

  return getCloudinary().url(publicId, {
    secure: true,
    transformation: [AGGRESSIVE_IMAGE_TRANSFORM],
  });
};

export default getCloudinary;
