import formidable from "formidable";
import fs from "fs";
import { connectToDatabase } from "@/lib/mongodb";
import Issue from "@/models/Issue";
import { verifyToken } from "@/middleware/auth";

export const config = {
  api: {
    bodyParser: false, // Required for formidable
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  await connectToDatabase();

  const form = formidable({
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB per file
    multiples: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ message: "Form parsing failed", error: err.message });
    }

    // Debug log
    console.log("Received files:", files);

    try {
      const decoded = verifyToken(req);
      const userId = decoded.id;

      // ✅ Extract fields as strings
      const title = fields.title?.[0] || "";
      const category = fields.category?.[0] || "";
      const description = fields.description?.[0] || "";
      const location = fields.location?.[0] || "";
      const latitude = parseFloat(fields.latitude?.[0]);
      const longitude = parseFloat(fields.longitude?.[0]);

      // ✅ Move uploaded files to /public/uploads
      const imagePaths = [];
      if (files.images) {
        try {
          const fileArray = Array.isArray(files.images) ? files.images : [files.images];
          console.log("Processing files:", fileArray.length);

          for (const file of fileArray) {
            try {
              const fileName = Date.now() + "-" + file.originalFilename;
              const newPath = `./public/uploads/${fileName}`;

              // Ensure uploads directory exists
              if (!fs.existsSync('./public/uploads')) {
                fs.mkdirSync('./public/uploads', { recursive: true });
              }

              // Debug log
              console.log("Copying file:", {
                from: file.filepath,
                to: newPath,
                size: file.size
              });

              // In case of cross-device issue, use copy + unlink instead of rename
              fs.copyFileSync(file.filepath, newPath);
              fs.unlinkSync(file.filepath);

              imagePaths.push(`/uploads/${fileName}`);
            } catch (fileErr) {
              console.error("Error processing file:", fileErr);
              throw new Error(`File processing failed: ${fileErr.message}`);
            }
          }
        } catch (filesErr) {
          console.error("Error processing files array:", filesErr);
          throw new Error(`Files processing failed: ${filesErr.message}`);
        }
      }

      // ✅ Save issue to DB
      const issue = new Issue({
        title,
        category,
        description,
        location,
        latitude,
        longitude,
        status: "Pending Approval",
        userId,
        images: imagePaths,
        updates: ["Issue submitted and pending approval"]
      });

      await issue.save();

      return res.status(201).json({ message: "Issue reported successfully", issue });
    } catch (err) {
      console.error("Error creating issue:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });
}
