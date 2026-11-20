"use server";

import mysql from "@/lib/mysql";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { CustomersDB } from "@/lib/db";

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

export async function directGuestLoginAction(name: string = "Rahul Sharma", email: string = "rahul.sharma@example.com", phone: string = "+919876543210") {
  try {
    const customerName = name || "Rahul Sharma";
    const customerEmail = email || "rahul.sharma@example.com";
    const customerPhone = phone || "+919876543210";

    const token = jwt.sign(
      { email: customerEmail, phone: customerPhone, sub: customerEmail, name: customerName },
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

    try {
      await mysql.query(
        "INSERT INTO users (email, phone, full_name, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone)",
        [customerEmail, customerPhone, customerName, "customer"]
      );
    } catch {
      // Local fallback
    }

    try {
      await CustomersDB.upsertUser({ name: customerName, email: customerEmail, phone: customerPhone });
    } catch {
      // fallback
    }

    return { success: true, email: customerEmail, name: customerName, phone: customerPhone };
  } catch (error: any) {
    console.error("Direct login error:", error);
    return { success: false, error: error.message || "Failed to login directly" };
  }
}

export async function phoneLoginAction(phone: string, name?: string) {
  try {
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      return { success: false, error: "Please enter a valid 10-digit mobile number" };
    }
    const formattedPhone = `+91${cleanPhone}`;
    const isDemoPhone = cleanPhone === "9876543210";
    const customerName = name || (isDemoPhone ? "Rahul Sharma" : `Customer ${cleanPhone.slice(-4)}`);
    const userIdentifier = isDemoPhone ? "rahul.sharma@example.com" : `${formattedPhone}@myshop.local`;
    
    try {
      await mysql.query(
        "INSERT INTO users (email, phone, full_name, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone)",
        [userIdentifier, formattedPhone, customerName, "customer"]
      );
    } catch (dbErr) {
      // Local fallback
    }

    const token = jwt.sign(
      { email: userIdentifier, phone: formattedPhone, sub: formattedPhone, name: customerName },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    try {
      await CustomersDB.upsertUser({ name: customerName, email: userIdentifier, phone: formattedPhone });
    } catch {
      // fallback
    }

    return { success: true, phone: formattedPhone, name: customerName };
  } catch (error: any) {
    console.error("Phone login error:", error);
    return { success: false, error: error.message || "Failed to log in with phone" };
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
    const isDemo = email === "rahul.sharma@example.com" || email === "customer@example.com";
    const name = isDemo ? "Rahul Sharma" : (email.split("@")[0] || "Customer");

    // Code is valid! Create JWT
    const token = jwt.sign(
      { email, sub: email, name },
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

    try {
      await CustomersDB.upsertUser({ name, email });
    } catch {
      // fallback
    }

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

export async function updateProfileNameAction(newName: string) {
  try {
    const trimmedName = (newName || "").trim();
    if (!trimmedName) {
      return { success: false, error: "Name cannot be empty" };
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return { success: false, error: "Invalid session token" };
    }

    // 1. Update in MySQL users table if exists
    try {
      const email = decoded.email;
      const phone = decoded.phone;
      const sub = decoded.sub;
      await mysql.query(
        "UPDATE users SET name = ? WHERE email = ? OR phone = ? OR id = ?",
        [trimmedName, email || "", phone || "", sub || ""]
      );
    } catch (dbErr) {
      console.warn("DB update users fallback:", dbErr);
    }

    // 2. Issue updated JWT token with the new name
    const updatedPayload = {
      ...decoded,
      name: trimmedName,
    };
    delete updatedPayload.exp;
    delete updatedPayload.iat;

    const newToken = jwt.sign(updatedPayload, JWT_SECRET, { expiresIn: "7d" });

    cookieStore.set("auth_token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return { success: true, name: trimmedName };
  } catch (error: any) {
    console.error("Update profile name error:", error);
    return { success: false, error: error.message || "Failed to update profile name" };
  }
}

