import { NextResponse } from "next/server";
import mysql from "@/lib/mysql";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
    if (id) {
      // Fetch specific order with items
      const order: any = await mysql.query(`
        SELECT * FROM orders WHERE id = ?
      `, [id]);
      
      if (order.length === 0) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      
      const items = await mysql.query(`
        SELECT oi.*, p.name, p.unit 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [id]);
      
      return NextResponse.json({ ...order[0], items });
    }

    // Fetch all orders with item count
    const orders = await mysql.query(`
      SELECT o.*, 
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count 
      FROM orders o 
      ORDER BY o.created_at DESC
    `);
    
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    await mysql.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  try {
    await mysql.query('DELETE FROM orders WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
