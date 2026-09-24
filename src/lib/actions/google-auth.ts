"use server";

import { OAuth2Client } from "google-auth-library";
import mysql from "@/lib/mysql";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev-only-change-this";

export async function googleLoginAction(idToken: string) {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error("GOOGLE_CLIENT_ID is not configured");
    }

    // 1. Verify the ID Token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new Error("Invalid Google token payload");
    }

    const { email, name, sub: googleId } = payload;

    // 2. Sync with local MySQL users table
    // Check if user exists
    let user = await mysql.getOne("users", "email", email);

    if (!user) {
      // Create new user if they don't exist
      await mysql.insert("users", {
        email,
        full_name: name || "Google User",
        role: "user",
      });
      user = await mysql.getOne("users", "email", email);
    }

    // 3. Create Session (JWT + Cookie)
    // We use the email as 'sub' to match the existing verifyOtpAction logic
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
    console.error("Google login error:", error);
    return { success: false, error: error.message || "Google authentication failed" };
  }
}
