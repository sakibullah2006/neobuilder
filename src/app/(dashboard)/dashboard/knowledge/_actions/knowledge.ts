"use server";

import { db } from "@/db";
import { chatbots, knowledgeSources } from "@/db/schema/chatbot";
import { eq } from "drizzle-orm";
import { uploadTrainingFile } from "@/lib/storage";
import { supabaseAdmin } from "@/lib/supabase";

// ─── Chatbots ────────────────────────────────────────────────────────────────

export async function getChatbotsForOrg(organizationId: string) {
    return db.query.chatbots.findMany({
        where: eq(chatbots.organizationId, organizationId),
        orderBy: (t, { desc }) => [desc(t.createdAt)],
    });
}

export async function createChatbot(data: {
    userId: string;
    organizationId: string;
    name: string;
    systemPrompt?: string;
    welcomeMessage?: string;
    brandColor?: string;
    calendlyLink?: string;
}) {
    const [bot] = await db
        .insert(chatbots)
        .values({
            userId: data.userId,
            organizationId: data.organizationId,
            name: data.name,
            systemPrompt: data.systemPrompt,
            welcomeMessage: data.welcomeMessage,
            brandColor: data.brandColor,
            calendlyLink: data.calendlyLink ?? null,
        })
        .returning();
    return bot;
}

export async function updateChatbot(
    botId: string,
    data: Partial<{
        name: string;
        systemPrompt: string;
        welcomeMessage: string;
        brandColor: string;
        calendlyLink: string;
        isActive: boolean;
    }>,
) {
    const [bot] = await db
        .update(chatbots)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(chatbots.id, botId))
        .returning();
    return bot;
}

// ─── Knowledge Sources ────────────────────────────────────────────────────────

export async function getKnowledgeSources(botId: string) {
    return db.query.knowledgeSources.findMany({
        where: eq(knowledgeSources.botId, botId),
        orderBy: (t, { desc }) => [desc(t.createdAt)],
    });
}

// ─── File upload ──────────────────────────────────────────────────────────────

/**
 * Upload a training file to Supabase and return a signed URL valid for 24 h.
 * Called from the client via a server action.
 */
export async function uploadAndGetSignedUrl(
    orgId: string,
    botId: string,
    formData: FormData,
): Promise<{ signedUrl: string; fileName: string; fileType: string }> {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    const { path } = await uploadTrainingFile(orgId, botId, file);

    const { data, error } = await supabaseAdmin.storage
        .from("training-data")
        .createSignedUrl(path, 60 * 60 * 24); // 24 hours

    if (error || !data) throw new Error(error?.message ?? "Failed to create signed URL");

    return {
        signedUrl: data.signedUrl,
        fileName: file.name,
        fileType: file.type,
    };
}
