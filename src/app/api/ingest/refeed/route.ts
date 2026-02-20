import { NextResponse } from "next/server";
import { db } from "@/db";
import { knowledgeSources, botKnowledge } from "@/db/schema";
import { eq } from "drizzle-orm";

const n8nIngestFileUrl = process.env.WEBHOOK_INGEST_FILE!;
const n8nIngestUrl = process.env.WEBHOOK_INGEST_URL!;


export async function POST(req: Request) {
    try {
        const { sourceId } = await req.json();

        const source = await db.query.knowledgeSources.findFirst({
            where: eq(knowledgeSources.id, sourceId)
        });
        if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // Wipe the old memory chunks
        await db.delete(botKnowledge).where(eq(botKnowledge.sourceId, sourceId));

        // Set status back to processing
        await db.update(knowledgeSources)
            .set({ status: "processing", updatedAt: new Date() })
            .where(eq(knowledgeSources.id, sourceId));

        // Retrigger n8n based on type
        const webhookUrl = source.type === "url"
            ? n8nIngestUrl
            : n8nIngestFileUrl;

        fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                url: source.fileUrl,
                botId: source.botId,
                sourceId: source.id,
                fileUrl: source.fileUrl
            }),
        }).catch(console.error);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[ingest/refeed]", error);
        return NextResponse.json({ error: "Failed to refeed" }, { status: 500 });
    }
}