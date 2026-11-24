import User from "../models/User.js";
import getCloudinary, {
  buildOptimizedCloudinaryImageUrl,
  getCloudinaryImageUploadOptions,
} from "../config/cloudinary.js";

const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_GIF_UPLOAD_BYTES = 30 * 1024 * 1024;
const CLOUDINARY_IMAGE_LIMIT_BYTES = 10 * 1024 * 1024;

// @desc    Upload image to local /uploads folder
// @route   POST /api/upload
// @access  Private/Admin
export const uploadImage = async (req, res) => {
  let keepLocalFile = false;

  const cleanupTempFile = async () => {
    if (!req?.file?.path || keepLocalFile) return;
    try {
      await import("fs").then((fs) => fs.unlinkSync(req.file.path));
    } catch (e) {
      console.warn("Failed to delete local file after upload attempt", e);
    }
  };

  try {
    if (!req.file) {
      console.error("No file uploaded. req.file:", req.file);
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }

    const isGifUpload =
      req.file.mimetype === "image/gif" ||
      String(req.file.originalname || "")
        .toLowerCase()
        .endsWith(".gif");
    const maxAllowedBytes = isGifUpload
      ? MAX_GIF_UPLOAD_BYTES
      : MAX_IMAGE_UPLOAD_BYTES;

    if (Number(req.file.size || 0) > maxAllowedBytes) {
      return res.status(413).json({
        success: false,
        error: isGifUpload
          ? "Image upload failed: GIF file size must be 30MB or less"
          : "Image upload failed: file size must be 10MB or less",
      });
    }

    if (
      isGifUpload &&
      Number(req.file.size || 0) > CLOUDINARY_IMAGE_LIMIT_BYTES
    ) {
      keepLocalFile = true;
      const localUrl = `/uploads/${req.file.filename}`;

      return res.json({
        success: true,
        data: {
          url: localUrl,
          originalUrl: localUrl,
          public_id: req.file.filename,
        },
      });
    }

    let result;
    try {
      const baseImageUploadOptions = getCloudinaryImageUploadOptions();
      const uploadOptions = isGifUpload
        ? {
            folder: baseImageUploadOptions.folder,
            resource_type: "auto",
          }
        : baseImageUploadOptions;

      result = await getCloudinary().uploader.upload(
        req.file.path,
        uploadOptions,
      );
    } catch (cloudErr) {
      console.error("Cloudinary upload error:", cloudErr);
      const isTooLarge =
        Number(cloudErr?.http_code) === 400 &&
        String(cloudErr?.message || "")
          .toLowerCase()
          .includes("file size too large");

      return res.status(isTooLarge ? 413 : 500).json({
        success: false,
        error: isTooLarge
          ? isGifUpload
            ? "Image upload failed: GIF file size must be 30MB or less"
            : "Image upload failed: file size must be 10MB or less"
          : `Cloudinary upload failed: ${cloudErr.message || cloudErr}`,
      });
    }

    res.json({
      success: true,
      data: {
        url: isGifUpload
          ? result.secure_url
          : buildOptimizedCloudinaryImageUrl(result.public_id),
        originalUrl: result.secure_url,
        public_id: result.public_id,
      },
    });
  } catch (error) {
    console.error("Image upload failed:", error);
    res.status(500).json({
      success: false,
      error: `Image upload failed: ${error.message || error}`,
    });
  } finally {
    await cleanupTempFile();
  }
};

// @desc    Upload video to local /uploads folder
// @route   POST /api/upload/video
// @access  Private/Admin
export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }

    const videoUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        url: videoUrl,
        public_id: req.file.filename,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Video upload failed" });
  }
};

// @desc    Upload and save user avatar
// @route   POST /api/upload/avatar
// @access  Private
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: imageUrl },
      {
        new: true,
      },
    );

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      data: {
        user,
        url: imageUrl,
        public_id: req.file.filename,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Avatar upload failed" });
  }
};

// @desc    Delete image from /uploads folder
// @route   DELETE /api/upload/:filename
// @access  Private/Admin
export const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join("uploads", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Image deletion failed" });
  }
};
