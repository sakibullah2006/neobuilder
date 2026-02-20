ALTER TABLE "chatbots" ADD COLUMN "organization_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "chatbots" ADD CONSTRAINT "chatbots_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chatbots_org_idx" ON "chatbots" USING btree ("organization_id");