"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { getChatbotsForOrg, createChatbot } from "../_actions/assistant";

type Chatbot = Awaited<ReturnType<typeof getChatbotsForOrg>>[number];

interface CreateChatbotFormProps {
    onCreated: (bot: Chatbot) => void;
}

export function CreateChatbotForm({ onCreated }: CreateChatbotFormProps) {
    const { data: session } = authClient.useSession();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const [name, setName] = useState("");
    const [systemPrompt, setSystemPrompt] = useState("You are a helpful assistant.");
    const [welcomeMessage, setWelcomeMessage] = useState("Hi! How can I help you today?");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) { toast.error("Name is required"); return; }
        if (!session?.user?.id || !activeOrg?.id) { toast.error("Session not ready"); return; }
        setLoading(true);
        try {
            const bot = await createChatbot({
                userId: session.user.id,
                organizationId: activeOrg.id,
                name: name.trim(),
                systemPrompt,
                welcomeMessage,
            });
            toast.success(`"${bot.name}" created`);
            onCreated(bot);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to create assistant");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create Assistant
                </CardTitle>
                <CardDescription>
                    Set up a new AI assistant for your organization.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="bot-name">Name <span className="text-destructive">*</span></Label>
                    <Input
                        id="bot-name"
                        placeholder="e.g. Support Bot"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bot-system-prompt">System Prompt</Label>
                    <Textarea
                        id="bot-system-prompt"
                        rows={4}
                        placeholder="You are a helpful assistant..."
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                        This defines the assistant&apos;s personality and behaviour.
                    </p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bot-welcome">Welcome Message</Label>
                    <Input
                        id="bot-welcome"
                        placeholder="Hi! How can I help you today?"
                        value={welcomeMessage}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWelcomeMessage(e.target.value)}
                    />
                </div>
                <Button onClick={handleCreate} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Assistant
                </Button>
            </CardContent>
        </Card>
    );
}
