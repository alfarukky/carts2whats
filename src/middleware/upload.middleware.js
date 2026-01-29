import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const multerUpload = multer({ 
  storage,
  limits: { 
    fileSize: 2 * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype.toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      return cb(new multer.MulterError("INVALID_FILE_EXTENSION"));
    }
    
    if (!allowedMimeTypes.includes(mimeType)) {
      return cb(new multer.MulterError("INVALID_MIME_TYPE"));
    }
    
    cb(null, true);
  }
});

// Image optimization utility
async function optimizeImage(file) {
  const outputPath = path.join(
    file.destination,
    "opt-" + file.filename.replace(/\.\w+$/, ".webp")
  );

  await sharp(file.path)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);

  return "opt-" + file.filename.replace(/\.\w+$/, ".webp");
}

export function uploadSingle(fieldName) {
  return async (req, res, next) => {
    multerUpload.single(fieldName)(req, res, async (err) => {
      if (err) {
        // Handle Multer errors
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            req.flash("error", "Image too large. Maximum size is 2MB.");
          } else if (err.code === "INVALID_FILE_EXTENSION") {
            req.flash("error", "Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed.");
          } else if (err.code === "INVALID_MIME_TYPE") {
            req.flash("error", "Invalid file format. Only image files are allowed.");
          } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
            req.flash("error", "Invalid file type. Only images are allowed.");
          } else {
            req.flash("error", "Image upload failed.");
          }
        } else {
          req.flash("error", "Image upload failed. Please try again.");
        }
        return res.redirect("back");
      }

      // Optimize image if uploaded
      if (req.file) {
        try {
          const optimizedName = await optimizeImage(req.file);
          req.file.optimizedName = optimizedName;
        } catch (error) {
          console.error("Image optimization failed:", error);
          // Continue without optimization
        }
      }

      next();
    });
  };
}

export default multerUpload;
