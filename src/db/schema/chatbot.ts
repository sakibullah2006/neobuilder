import { pgTable, text, timestamp, boolean, uuid, vector, jsonb, index, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
// Import the 'user' table from your auth schema to link foreign keys
import { user } from "./auth-schema";

// --- ENUMS ---
// Enforce strict status types for data integrity
export const sourceStatusEnum = pgEnum("source_status", ["processing", "ready", "error"]);
export const senderEnum = pgEnum("sender_type", ["user", "ai", "admin", "system"]);

// --- 1. CHATBOTS (The Container) ---
export const chatbots = pgTable("chatbots", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }), // If User is deleted, Bot is deleted
    name: text("name").notNull(),

    // Customization
    systemPrompt: text("system_prompt").default("You are a helpful assistant."),
    welcomeMessage: text("welcome_message").default("Hi! How can I help you today?"),
    brandColor: text("brand_color").default("#000000"),

    // Business Logic
    calendlyLink: text("calendly_link"),
    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
    // Index for faster queries when listing a user's bots
    index("chatbots_user_idx").on(table.userId)
]);

// --- 2. KNOWLEDGE SOURCES (The Files/Links) ---
export const knowledgeSources = pgTable("knowledge_sources", {
    id: uuid("id").primaryKey().defaultRandom(),
    botId: uuid("bot_id")
        .notNull()
        .references(() => chatbots.id, { onDelete: "cascade" }), // If Bot is deleted, Files are deleted

    type: text("type").notNull(), // 'pdf', 'url', 'text', 'md', 'docx', 'doc', 'mdx
    fileName: text("file_name").notNull(),
    fileUrl: text("file_url"), // URL to Supabase Storage or the web link

    // Track ingestion status so UI knows when to show "Ready"
    status: sourceStatusEnum("status").default("processing").notNull(),

    characterCount: text("character_count"), // Useful for usage limits
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- 3. BOT KNOWLEDGE (The Brain / Vectors) ---
export const botKnowledge = pgTable("bot_knowledge", {
    id: uuid("id").primaryKey().defaultRandom(),
    botId: uuid("bot_id")
        .notNull()
        .references(() => chatbots.id, { onDelete: "cascade" }),

    sourceId: uuid("source_id")
        .references(() => knowledgeSources.id, { onDelete: "cascade" }), // If File is deleted, Chunks are deleted

    content: text("content").notNull(), // The actual text chunk

    // The Vector Embedding (OpenAI text-embedding-3-small = 1536 dims)
    // Note: You must enable the 'vector' extension in Postgres first!
    embedding: vector("embedding", { dimensions: 1536 }),

    metadata: jsonb("metadata"), // Store page numbers, section headers, etc.
}, (table) => [
    // Critical index for Vector Search performance (HNSW)
    index("knowledge_bot_idx").on(table.botId),
]);

// --- 4. CONVERSATIONS (The Inbox Threads) ---
export const conversations = pgTable("conversations", {
    id: uuid("id").primaryKey().defaultRandom(),
    botId: uuid("bot_id")
        .notNull()
        .references(() => chatbots.id, { onDelete: "cascade" }),

    visitorId: text("visitor_id").notNull(), // Fingerprint from the widget

    // The "Takeover" Flag
    isHumanControlled: boolean("is_human_controlled").default(false).notNull(),

    // Contact Info (captured during chat)
    visitorEmail: text("visitor_email"),
    visitorName: text("visitor_name"),
    visitorPhone: text("visitor_phone"),

    lastMessageAt: timestamp("last_message_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- 5. MESSAGES (The History) ---
export const messages = pgTable("messages", {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
        .notNull()
        .references(() => conversations.id, { onDelete: "cascade" }),

    sender: senderEnum("sender").notNull(), // 'user' (visitor) | 'ai' | 'admin'
    content: text("content").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
    // Index to quickly load chat history
    index("messages_conversation_idx").on(table.conversationId)
]);

// --- RELATIONS (For easier Drizzle Queries) ---

export const chatbotsRelations = relations(chatbots, ({ one, many }) => ({
    user: one(user, {
        fields: [chatbots.userId],
        references: [user.id],
    }),
    sources: many(knowledgeSources),
    knowledge: many(botKnowledge),
    conversations: many(conversations),
}));

export const knowledgeSourcesRelations = relations(knowledgeSources, ({ one, many }) => ({
    bot: one(chatbots, {
        fields: [knowledgeSources.botId],
        references: [chatbots.id],
    }),
    chunks: many(botKnowledge),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
    bot: one(chatbots, {
        fields: [conversations.botId],
        references: [chatbots.id],
    }),
    messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
    conversation: one(conversations, {
        fields: [messages.conversationId],
        references: [conversations.id],
    }),
}));