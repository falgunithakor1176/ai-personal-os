import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(
  email: string,
  otp: string
) {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Verify your email</h2>

      <p>Your verification code is:</p>

      <h1>${otp}</h1>

      <p>This code will expire in 10 minutes.</p>

      <p>If you did not create this account, you can ignore this email.</p>
    `,
  });

  return info;
}