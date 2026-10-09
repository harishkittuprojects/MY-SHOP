import { NextResponse } from "next/server";
import { BrandsDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const all = await BrandsDB.getAll(category);
    const active = all.filter((b: any) => b.is_active !== false);
    return NextResponse.json(active);
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}
