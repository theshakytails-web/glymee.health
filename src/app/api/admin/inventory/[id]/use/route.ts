import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { inventoryItems, inventoryUsage } from "@/db/schema";
import { sql, eq, desc } from "drizzle-orm";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { quantityUsed, notes } = body;

    const used = parseFloat(quantityUsed);
    if (!used || used <= 0) {
      return NextResponse.json(
        { error: "Quantity used must be a positive number" },
        { status: 400 }
      );
    }

    const [item] = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.id, id));

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.quantity < used) {
      return NextResponse.json(
        { error: `Insufficient stock. Available: ${item.quantity} ${item.unit}` },
        { status: 400 }
      );
    }

    const now = new Date();

    await db
      .update(inventoryItems)
      .set({
        quantity: sql`${inventoryItems.quantity} - ${used}`,
        updatedAt: now,
      })
      .where(eq(inventoryItems.id, id));

    await db.insert(inventoryUsage).values({
      id: crypto.randomUUID(),
      itemId: id,
      quantityUsed: used,
      notes: notes || "",
      usedAt: now,
      createdAt: now,
    });

    return NextResponse.json({
      success: true,
      remaining: item.quantity - used,
    });
  } catch (error) {
    console.error("Inventory use error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const usage = await db
      .select()
      .from(inventoryUsage)
      .where(eq(inventoryUsage.itemId, id))
      .orderBy(desc(inventoryUsage.usedAt))
      .limit(100);

    return NextResponse.json({ usage });
  } catch (error) {
    console.error("Inventory usage history error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
