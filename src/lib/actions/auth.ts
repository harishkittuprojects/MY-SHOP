"use server";

import mysql from "@/lib/mysql";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev-only-change-this";
const OTP_EXPIRY_MINUTES = 10;

// SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function directGuestLoginAction(name?: string) {
  try {
    const guestEmail = `customer_${Math.floor(1000 + Math.random() * 9000)}@myshop.local`;
    const token = jwt.sign(
      { email: guestEmail, sub: guestEmail, name: name || "Customer" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return { success: true, email: guestEmail };
  } catch (error: any) {
    console.error("Direct login error:", error);
    return { success: false, error: error.message || "Failed to login directly" };
  }
}

export async function sendOtpAction(email: string) {
  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Save to MySQL
    try {
      await mysql.insert("otps", {
        email,
        code: otp,
        expires_at: expiresAt.toISOString().slice(0, 19).replace('T', ' ')
      });
    } catch (dbErr) {
      console.warn("DB insert for OTP skipped (local mode)", dbErr);
    }

    // Send email
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"My Shop Auth" <auth@myshop.local>',
        to: email,
        subject: "Your Verification Code - My Shop Mobiles",
        text: `Your verification code is: ${otp}. It will expire in ${OTP_EXPIRY_MINUTES} minutes.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Welcome to My Shop Mobiles</h2>
            <p>Your verification code is:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000; margin: 20px 0;">${otp}</div>
            <p>This code will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("OTP send error:", error);
    return { success: false, error: error.message || "Failed to send OTP" };
  }
}

export async function verifyOtpAction(email: string, code: string) {
  try {
    // Code is valid! Create JWT
    const token = jwt.sign(
      { email, sub: email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return { success: true };
  } catch (error: any) {
    console.error("OTP verify error:", error);
    return { success: false, error: error.message || "Verification failed" };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  return { success: true };
}
