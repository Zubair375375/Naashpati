const MEDIA_API_ORIGIN = (import.meta.env.VITE_API_URL || "/api").replace(
  /\/api\/?$/,
  "",
);

const CLOUDINARY_OPTIMIZATION =
  "f_auto,q_auto:eco,dpr_auto,c_limit,w_2000,fl_progressive:steep";

const injectCloudinaryTransform = (url) => {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  const [prefix, tail] = url.split("/upload/");
  if (!prefix || !tail) return url;

  const parts = tail.split("/");
  if (parts.length === 0) return url;

  const firstSegment = parts[0] || "";

  // If URL has no transformation block (starts with version), inject our aggressive defaults.
  if (/^v\d+$/i.test(firstSegment)) {
    return `${prefix}/upload/${CLOUDINARY_OPTIMIZATION}/${tail}`;
  }

  // If it already has modern format/quality optimization, keep as-is.
  if (
    firstSegment.includes("f_auto") ||
    firstSegment.includes("q_auto") ||
    firstSegment.includes("q_")
  ) {
    return url;
  }

  return `${prefix}/upload/${CLOUDINARY_OPTIMIZATION},${tail}`;
};

export const resolveMediaUrl = (url, fallback = "/placeholder-product.jpg") => {
  if (!url) return fallback;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return injectCloudinaryTransform(url);
  }

  if (url.startsWith("/uploads/")) {
    return `${MEDIA_API_ORIGIN}${url}`;
  }

  return url;
};

export default resolveMediaUrl;
