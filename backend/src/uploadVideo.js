const multer = require("multer");
const fs = require("fs");

const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-cal." + (file.mimetype.split("/")[1] || "webm")),
});

const allowed = new Set([
  "video/webm",
  "video/mp4",
  "video/ogg",
]);

function fileFilter(req, file, cb) {
  if (allowed.has(file.mimetype)) cb(null, true);
  else cb(new Error("Unsupported video type"), false);
}

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});
