"use server";

import { OrdersDB } from "@/lib/db";
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
  delivery_charge?: number;
  discount_amount?: number;
  items: {
    product_id?: string;
    id?: string;
    name?: string;
    quantity: number;
    price: number;
    unit?: string;
  }[];
}) {
  try {
    let email = orderData.customer_email;

    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("auth_token")?.value;
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
        if (decoded?.email) email = decoded.email.toLowerCase();
      }
    } catch { /* proceed with given email */ }

    const formattedItems = (orderData.items || []).map(i => ({
      id: i.id || i.product_id,
      product_id: i.product_id || i.id,
      name: i.name || 'Product',
      quantity: Number(i.quantity) || 1,
      price: Number(i.price) || 0,
      unit: i.unit || ''
    }));

    const result = await OrdersDB.create({
      customer_name: orderData.customer_name || 'Customer',
      customer_phone: orderData.customer_phone || '',
      customer_email: email || '',
      shipping_address: orderData.shipping_address + (orderData.location_link ? ` (Map: ${orderData.location_link})` : ''),
      items: formattedItems,
      subtotal: Number(orderData.total_amount) - (Number(orderData.delivery_charge) || 0) + (Number(orderData.discount_amount) || 0),
      delivery_fee: Number(orderData.delivery_charge) || 0,
      discount_amount: Number(orderData.discount_amount) || 0,
      total_amount: Number(orderData.total_amount) || 0,
      payment_method: orderData.payment_method || 'Online Payment',
      payment_status: orderData.payment_method?.toLowerCase().includes('cod') ? 'pending' : 'paid',
      order_status: 'pending',
    });

    return { success: true, orderId: result.id };
  } catch (error: any) {
    console.error("Place order action error:", error);
    return { success: false, error: error.message || "Failed to place order." };
  }
}
