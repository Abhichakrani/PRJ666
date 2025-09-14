import 'dotenv/config';
import mongoose from "mongoose";
import Issue from "../src/models/Issue.js";
import { connectToDatabase } from "../src/lib/mongodb.js";

async function migrateUpdates() {
  try {
    await connectToDatabase();

    // Find all issues with updates as array of strings
    const issues = await Issue.find({ updates: { $type: "array" } });

    for (const issue of issues) {
      let needsUpdate = false;

      if (issue.updates && issue.updates.length > 0) {
        // Check if first element is a string (indicating old format)
        if (typeof issue.updates[0] === "string") {
          // Convert all string updates to objects with default status and timestamp
          issue.updates = issue.updates.map((text) => ({
            text,
            status: issue.status || "Pending Approval",
            timestamp: new Date(issue.updatedAt || Date.now()),
          }));
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await issue.save();
        console.log(`Migrated updates for issue ${issue._id}`);
      }
    }

    console.log("Migration completed.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateUpdates();
