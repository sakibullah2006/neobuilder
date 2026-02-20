"use server";

import { db } from "@/db";
import { chatbots } from "@/db/schema/chatbot";
import { eq } from "drizzle-orm";

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
