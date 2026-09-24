"use server";

import mysql from "@/lib/mysql";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev-only-change-this";

export async function placeOrderAction(orderData: {
  total_amount: number;
  shipping_address: string;
  payment_method: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  location_link?: string;
  delivery_charge: number;
  items: {
    product_id: string;
    quantity: number;
    price: number;
    unit?: string;
  }[];
}) {
  try {
    // 1. Get user email from session cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    
    if (!token) throw new Error("You must be logged in to place an order.");
    
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
    const email = decoded.email.toLowerCase();

    // 2. Ensure Tables Exist (Self-healing)
    await mysql.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(255),
        customer_name VARCHAR(255),
        customer_name_old VARCHAR(255),
        customer_phone VARCHAR(20),
        customer_email VARCHAR(255),
        shipping_address TEXT,
        location_link TEXT,
        total_amount DECIMAL(10, 2),
        delivery_charge DECIMAL(10, 2) DEFAULT 0.00,
        payment_method VARCHAR(50),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await mysql.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,
        product_id INT,
        quantity INT,
        price DECIMAL(10, 2),
        unit VARCHAR(50),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);

    // Add columns if they missed in migration
    try {
      await mysql.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255)`);
      await mysql.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20)`);
      await mysql.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255)`);
      await mysql.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS location_link TEXT`);
      await mysql.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(10, 2) DEFAULT 0.00`);
    } catch (e) { /* ignore */ }

    // 3. Insert Order
    const orderResult: any = await mysql.insert('orders', {
      user_email: email,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      customer_email: orderData.customer_email,
      shipping_address: orderData.shipping_address,
      location_link: orderData.location_link,
      total_amount: orderData.total_amount,
      delivery_charge: orderData.delivery_charge,
      payment_method: orderData.payment_method,
      status: "pending"
    });

    const orderId = orderResult.insertId;

    // 3. Insert Order Items
    for (const item of orderData.items) {
      await mysql.insert('order_items', {
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit
      });
    }

    return { success: true, orderId: orderId.toString() };
  } catch (error: any) {
    console.error("Place order action error:", error);
    return { success: false, error: error.message || "Failed to place order." };
  }
}

