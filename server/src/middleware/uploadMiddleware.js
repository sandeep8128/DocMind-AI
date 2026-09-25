const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");

const uploadDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ======================================================
// 📦 PDF UPLOAD SIZE LIMITS
// ======================================================

// 🔴 CHANGE THESE VALUES LATER IF NEEDED

// Free user maximum PDF size
const FREE_MAX_FILE_SIZE_MB = 20;

// Pro user maximum PDF size
const PRO_MAX_FILE_SIZE_MB = 500;

// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const safeBaseName = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 80);

    const extension = path.extname(file.originalname).toLowerCase();

    const uniqueName = `${Date.now()}-${safeBaseName || "document"}${extension}`;

    cb(null, uniqueName);
  },
});

// ======================================================
// 📄 ONLY PDF FILES ALLOWED
// ======================================================

const fileFilter = (req, file, cb) => {
  const isPdf =
    file.mimetype === "application/pdf" ||
    path.extname(file.originalname).toLowerCase() === ".pdf";

  if (isPdf) {
    return cb(null, true);
  }

  return cb(new Error("Only PDF files are allowed"), false);
};

// ======================================================
// 🔐 DYNAMIC UPLOAD MIDDLEWARE
// ======================================================

const upload = async (req, res, next) => {
  try {
    // Get current user from database
    const user = await User.findById(req.user.id).select("plan");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ==================================================
    // FREE → 20 MB
    // PRO  → 500 MB
    // ==================================================

    const maxFileSizeMB =
      user.plan === "pro"
        ? PRO_MAX_FILE_SIZE_MB
        : FREE_MAX_FILE_SIZE_MB;

    const maxFileSizeBytes =
      maxFileSizeMB * 1024 * 1024;

    // Create multer dynamically according to plan
    const uploadMiddleware = multer({
      storage,
      fileFilter,

      limits: {
        fileSize: maxFileSizeBytes,
      },
    }).single("document");

    uploadMiddleware(req, res, (error) => {
      if (error) {
        // ==============================================
        // FILE SIZE ERROR
        // ==============================================

        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            success: false,
            message: `PDF size must be less than ${maxFileSizeMB} MB on your current plan.`,
          });
        }

        // ==============================================
        // OTHER MULTER ERRORS
        // ==============================================

        return next(error);
      }

      next();
    });
  } catch (error) {
    console.error("Upload Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process upload",
    });
  }
};

module.exports = upload;