import { NextResponse } from "next/server";
import { db } from "@/db";
import { knowledgeSources } from "@/db/schema";

const n8nUrl = process.env.WEBHOOK_INGEST_URL!;


export async function POST(req: Request) {
    try {
        const { url, botId } = await req.json();
        if (!url || !botId)
            return NextResponse.json({ error: "Missing data" }, { status: 400 });

        // 1. Save to database and get the generated sourceId back
        const [source] = await db
            .insert(knowledgeSources)
            .values({
                botId,
                type: "url",
                fileName: url, // using URL as the display name
                fileUrl: url,
                status: "processing",
            })
            .returning({ id: knowledgeSources.id });

        const sourceId = source.id;

        // 2. Trigger n8n Sitemap Spider (Fire and forget)
        fetch(n8nUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, botId, sourceId }),
        }).catch(console.error);

        return NextResponse.json({ success: true, sourceId });
    } catch (error) {
        console.error("[ingest/url]", error);
        return NextResponse.json({ error: "Failed to ingest URL" }, { status: 500 });
    }
}