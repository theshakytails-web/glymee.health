import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { inventoryItems } from "@/db/schema";
import { sql, or, like } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let rows;
    if (search) {
      rows = await db
        .select()
        .from(inventoryItems)
        .where(
          or(
            like(inventoryItems.name, `%${search}%`),
            like(inventoryItems.category, `%${search}%`)
          )
        )
        .orderBy(sql`${inventoryItems.name} ASC`);
    } else {
      rows = await db
        .select()
        .from(inventoryItems)
        .orderBy(sql`${inventoryItems.name} ASC`);
    }

    return NextResponse.json({ items: rows });
  } catch (error) {
    console.error("Inventory list error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, category, quantity, unit, minQuantity, notes } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Item name is required" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const now = new Date();

    await db.insert(inventoryItems).values({
      id,
      name,
      category: category || "general",
      quantity: parseFloat(quantity || "0"),
      unit: unit || "pcs",
      minQuantity: parseFloat(minQuantity || "0"),
      notes: notes || "",
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ success: true, item: { id } });
  } catch (error) {
    console.error("Inventory create error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
