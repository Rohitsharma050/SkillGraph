import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for Profile Images
const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "skillgraph/profile-images",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
    },
});

// Storage for Resume Files
const resumeStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "skillgraph/resumes",
        allowed_formats: ["pdf", "doc", "docx"],
        resource_type: "raw",
    },
});

// Combined multer upload (handles both fields: image + resume)
export const uploadProfile = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).fields([
    { name: "image", maxCount: 1 },
    { name: "resume", maxCount: 1 },
]);

// Helper: upload a buffer to Cloudinary
export const uploadToCloudinary = async (buffer, options) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
        stream.end(buffer);
    });
};

export { cloudinary };
