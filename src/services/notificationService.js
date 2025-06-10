import Notification from "../models/Notification";

export const sendNotification = async ({ userId, message }) => {
  try {
    await Notification.create({
      userId,
      message,
      read: false
    });
    
    // Optional: Add real-time push notification integration
    console.log(`Notification sent to user ${userId}: ${message}`);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};