import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"));
    }
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
