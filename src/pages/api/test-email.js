import { sendIssueStatusUpdateEmail, sendIssueAssignmentEmail, sendIssueEscalationEmail, sendIssueCreatedEmail } from "@/utils/mailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { testType, email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    switch (testType) {
      case "status_update":
        await sendIssueStatusUpdateEmail(
          email,
          "Test User",
          "Test Issue - Pothole on Main Street",
          "Under Review",
          "Our team has started investigating this issue and will provide updates soon."
        );
        break;

      case "assignment":
        await sendIssueAssignmentEmail(
          email,
          "Test Clerk",
          "Test Issue - Broken Streetlight"
        );
        break;

      case "escalation":
        await sendIssueEscalationEmail(
          email,
          "Test Admin",
          "Test Issue - Critical Infrastructure Problem",
          "Critical",
          "This issue requires immediate attention due to safety concerns and potential public risk."
        );
        break;

      case "issue_created":
        await sendIssueCreatedEmail(
          email,
          "Test Resident",
          "Test Issue - Garbage Overflow",
          "Garbage Collection",
          "123 Main Street, Toronto, ON"
        );
        break;

      default:
        return res.status(400).json({ message: "Invalid test type" });
    }

    res.status(200).json({ 
      message: `Test email sent successfully to ${email}`,
      testType 
    });

  } catch (error) {
    console.error("Email test error:", error);
    res.status(500).json({ 
      message: "Failed to send test email",
      error: error.message 
    });
  }
} 