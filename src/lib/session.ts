import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import mysql from "@/lib/mysql";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev-only-change-this";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; sub: string; name?: string; phone?: string };
    
    let displayName = decoded.name;

    // Check database for any updated name
    try {
      const dbUsers: any = await mysql.query(
        "SELECT name FROM users WHERE email = ? OR phone = ? OR id = ? LIMIT 1",
        [decoded.email || "", decoded.phone || "", decoded.sub || ""]
      );
      if (dbUsers && dbUsers[0]?.name) {
        displayName = dbUsers[0].name;
      }
    } catch {
      // Fallback to token decoded data
    }

    if (!displayName || displayName === "Customer") {
      if (decoded.email && !decoded.email.endsWith("@myshop.local")) {
        const username = decoded.email.split("@")[0];
        displayName = username.charAt(0).toUpperCase() + username.slice(1);
      } else if (decoded.phone) {
        displayName = `User ${decoded.phone.slice(-4)}`;
      } else {
        displayName = "Customer";
      }
    }

    return {
      user: {
        email: decoded.email,
        id: decoded.sub,
        name: displayName,
        phone: decoded.phone,
      },
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  } catch (error) {
    return null;
  }
}
