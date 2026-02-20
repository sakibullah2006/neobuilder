import { NextResponse } from "next/server";
import { db } from "@/db";
import { knowledgeSources } from "@/db/schema";

const n8nUrl = process.env.WEBHOOK_INGEST_FILE!;

export async function POST(req: Request) {
    try {
        // Note: In production, the client uploads to Supabase/S3 first, then sends the URL here.
        const { botId, fileName, fileUrl, fileType } = await req.json();


        const [source] = await db
            .insert(knowledgeSources)
            .values({
                botId,
                type: fileType,
                fileName,
                fileUrl,
                status: "processing"
            })
            .returning({ id: knowledgeSources.id });

        const sourceId = source.id;

        // Trigger n8n File Reader
        fetch(n8nUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ botId, sourceId, fileUrl }),
        }).catch(console.error);

        return NextResponse.json({ success: true, sourceId });
    } catch (error) {
        return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
    }
}