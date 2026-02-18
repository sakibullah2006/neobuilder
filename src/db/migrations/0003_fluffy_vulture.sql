CREATE TYPE "public"."sender_type" AS ENUM('user', 'ai', 'admin', 'system');--> statement-breakpoint
CREATE TYPE "public"."source_status" AS ENUM('processing', 'ready', 'error');--> statement-breakpoint
CREATE TABLE "bot_knowledge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bot_id" uuid NOT NULL,
	"source_id" uuid,
	"content" text NOT NULL,
	"embedding" vector(1536),
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "chatbots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"system_prompt" text DEFAULT 'You are a helpful assistant.',
	"welcome_message" text DEFAULT 'Hi! How can I help you today?',
	"brand_color" text DEFAULT '#000000',
	"calendly_link" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bot_id" uuid NOT NULL,
	"visitor_id" text NOT NULL,
	"is_human_controlled" boolean DEFAULT false NOT NULL,
	"visitor_email" text,
	"visitor_name" text,
	"visitor_phone" text,
	"last_message_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bot_id" uuid NOT NULL,
	"type" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text,
	"status" "source_status" DEFAULT 'processing' NOT NULL,
	"character_count" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender" "sender_type" NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bot_knowledge" ADD CONSTRAINT "bot_knowledge_bot_id_chatbots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."chatbots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_knowledge" ADD CONSTRAINT "bot_knowledge_source_id_knowledge_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."knowledge_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatbots" ADD CONSTRAINT "chatbots_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_bot_id_chatbots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."chatbots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_sources" ADD CONSTRAINT "knowledge_sources_bot_id_chatbots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."chatbots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "knowledge_bot_idx" ON "bot_knowledge" USING btree ("bot_id");--> statement-breakpoint
CREATE INDEX "chatbots_user_idx" ON "chatbots" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "messages_conversation_idx" ON "messages" USING btree ("conversation_id");