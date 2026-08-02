import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { inventoryItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { name, category, quantity, unit, minQuantity, notes } = body;

    const [existing] = await db
      .select({ id: inventoryItems.id })
      .from(inventoryItems)
      .where(eq(inventoryItems.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    const parsedQuantity = parseFloat(quantity);
    if (Number.isNaN(parsedQuantity) || parsedQuantity < 0) {
      return NextResponse.json(
        { error: "quantity must be a non-negative number" },
        { status: 400 }
      );
    }

    const parsedMinQuantity = parseFloat(minQuantity || "0");
    if (Number.isNaN(parsedMinQuantity) || parsedMinQuantity < 0) {
      return NextResponse.json(
        { error: "minQuantity must be a non-negative number" },
        { status: 400 }
      );
    }

    await db
      .update(inventoryItems)
      .set({
        name,
        category,
        quantity: parsedQuantity,
        unit,
        minQuantity: parsedMinQuantity,
        notes: notes || "",
        updatedAt: new Date(),
      })
      .where(eq(inventoryItems.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Inventory update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const [existing] = await db
      .select({ id: inventoryItems.id })
      .from(inventoryItems)
      .where(eq(inventoryItems.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    await db.delete(inventoryItems).where(eq(inventoryItems.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Inventory delete error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
