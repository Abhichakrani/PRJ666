import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: parseInt(process.env.MAILTRAP_PORT),
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
    },
});

export const sendResetEmail = async (to, token) => {
  const resetUrl = `https://community-service-app.vercel.app//reset-password?token=${token}`;
  await transporter.sendMail({
    from: '"Community Service App" <noreply@communityapp.ca>',
    to,
    subject: "Reset your password",
    html: `<p>Click below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
  });
};
