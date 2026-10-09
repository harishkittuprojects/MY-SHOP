import { NextResponse } from "next/server";
import { BrandsDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const brands = await BrandsDB.getAll(category);
    return NextResponse.json(brands);
  } catch (error) {
    console.error("Failed to load admin brands:", error);
    return NextResponse.json({ error: "Failed to load brands" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    const brand = await BrandsDB.create({
      name: body.name.trim(),
      query: body.query ? body.query.trim() : body.name.trim(),
      category: body.category || "Mobiles",
      logo_url: body.logo_url || "",
      is_active: body.is_active !== undefined ? body.is_active : true,
      display_order: Number(body.display_order) || 1,
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error("Failed to create brand:", error);
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "Brand ID is required" }, { status: 400 });
    }

    const updated = await BrandsDB.update(body.id, {
      name: body.name?.trim(),
      query: body.query ? body.query.trim() : body.name?.trim(),
      category: body.category,
      logo_url: body.logo_url,
      is_active: body.is_active,
      display_order: body.display_order !== undefined ? Number(body.display_order) : undefined,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update brand:", error);
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Brand ID is required" }, { status: 400 });
    }

    await BrandsDB.delete(id);
    return NextResponse.json({ success: true, message: "Brand deleted successfully" });
  } catch (error) {
    console.error("Failed to delete brand:", error);
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}
