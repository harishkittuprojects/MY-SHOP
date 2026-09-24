import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("Razorpay keys missing:", { keyId: !!keyId, keySecret: !!keySecret });
      return NextResponse.json(
        { success: false, error: "Razorpay configuration missing" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const { amount, currency = "INR", receipt } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    const options = {
      amount: Math.round(amount * 100), // paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("Razorpay order creation error:", JSON.stringify(error));
    return NextResponse.json(
      { success: false, error: error?.error?.description || error.message || "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
