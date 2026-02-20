import { NextResponse } from "next/server";
import { db } from "@/db";
import { knowledgeSources } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const sourceId = searchParams.get("sourceId");

        if (!sourceId) return NextResponse.json({ error: "Missing resource ID" }, { status: 400 });

        // Deleting the source triggers Drizzle's `onDelete: "cascade"`, wiping out the vector chunks!
        await db.delete(knowledgeSources).where(eq(knowledgeSources.id, sourceId));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete source" }, { status: 500 });
    }
}