"use client";

import { useCallback, useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Bot, Plus, Loader2, Settings2, Check } from "lucide-react";
import { getChatbotsForOrg, createChatbot, updateChatbot } from "./_actions/assistant";

type Chatbot = Awaited<ReturnType<typeof getChatbotsForOrg>>[number];

// ─── Create form ─────────────────────────────────────────────────────────────

function CreateChatbotForm({ onCreated }: { onCreated: (bot: Chatbot) => void }) {
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
                        This defines the assistant's personality and behaviour.
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

// ─── Edit form ────────────────────────────────────────────────────────────────

function EditChatbotForm({ bot, onUpdated }: { bot: Chatbot; onUpdated: (bot: Chatbot) => void }) {
    const [name, setName] = useState(bot.name);
    const [systemPrompt, setSystemPrompt] = useState(bot.systemPrompt ?? "");
    const [welcomeMessage, setWelcomeMessage] = useState(bot.welcomeMessage ?? "");
    const [brandColor, setBrandColor] = useState(bot.brandColor ?? "#000000");
    const [calendlyLink, setCalendlyLink] = useState(bot.calendlyLink ?? "");
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const updated = await updateChatbot(bot.id, {
                name: name.trim() || bot.name,
                systemPrompt,
                welcomeMessage,
                brandColor,
                calendlyLink: calendlyLink || undefined,
            });
            toast.success("Settings saved");
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            onUpdated(updated);
        } catch {
            toast.error("Failed to save settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5" />
                    {bot.name}
                    <Badge variant={bot.isActive ? "default" : "secondary"} className="ml-1 text-xs">
                        {bot.isActive ? "Active" : "Inactive"}
                    </Badge>
                </CardTitle>
                <CardDescription>Configure your assistant's settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-name">Name</Label>
                    <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="edit-system-prompt">System Prompt</Label>
                    <Textarea
                        id="edit-system-prompt"
                        rows={5}
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                        Defines the assistant's personality and instruction set.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="edit-welcome">Welcome Message</Label>
                    <Input id="edit-welcome" value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-color">Brand Color</Label>
                        <div className="flex gap-2 items-center">
                            <input
                                id="edit-color"
                                type="color"
                                value={brandColor}
                                onChange={(e) => setBrandColor(e.target.value)}
                                className="h-9 w-9 rounded border cursor-pointer bg-transparent p-0.5"
                            />
                            <Input
                                value={brandColor}
                                onChange={(e) => setBrandColor(e.target.value)}
                                className="font-mono text-sm"
                                placeholder="#000000"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-calendly">Calendly Link <span className="text-muted-foreground font-normal">(optional)</span></Label>
                        <Input
                            id="edit-calendly"
                            placeholder="https://calendly.com/..."
                            value={calendlyLink}
                            onChange={(e) => setCalendlyLink(e.target.value)}
                        />
                    </div>
                </div>

                <Button onClick={handleSave} disabled={loading}>
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : saved ? (
                        <Check className="mr-2 h-4 w-4" />
                    ) : null}
                    {saved ? "Saved!" : "Save Settings"}
                </Button>
            </CardContent>
        </Card>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AssistantPage() {
    const { data: activeOrg } = authClient.useActiveOrganization();
    const [chatbots, setChatbots] = useState<Chatbot[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const loadBots = useCallback(async (orgId: string) => {
        setLoading(true);
        try {
            const bots = await getChatbotsForOrg(orgId);
            setChatbots(bots);
            if (bots.length > 0 && !selectedId) setSelectedId(bots[0].id);
        } catch {
            toast.error("Failed to load assistants");
        } finally {
            setLoading(false);
        }
    }, [selectedId]);

    useEffect(() => {
        if (activeOrg?.id) loadBots(activeOrg.id);
    }, [activeOrg?.id, loadBots]);

    const selectedBot = chatbots.find((b) => b.id === selectedId) ?? null;

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Bot className="h-7 w-7" />
                    Assistant
                </h2>
                <p className="text-muted-foreground mt-1">
                    Create and configure your AI assistants.
                </p>
            </div>

            <Separator />

            {/* Bot list / selector */}
            {chatbots.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    {chatbots.map((bot) => (
                        <button
                            key={bot.id}
                            onClick={() => setSelectedId(bot.id)}
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors ${selectedId === bot.id
                                ? "bg-primary text-primary-foreground border-primary"
                                : "hover:bg-muted"
                                }`}
                        >
                            <Bot className="h-3.5 w-3.5" />
                            {bot.name}
                        </button>
                    ))}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Edit existing */}
                {selectedBot ? (
                    <EditChatbotForm
                        key={selectedBot.id}
                        bot={selectedBot}
                        onUpdated={(updated) =>
                            setChatbots((prev) =>
                                prev.map((b) => (b.id === updated.id ? updated : b)),
                            )
                        }
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center gap-3 text-muted-foreground">
                        <Bot className="h-10 w-10" />
                        <p className="text-sm">Select an assistant to edit its settings</p>
                    </div>
                )}

                {/* Create new */}
                <CreateChatbotForm
                    onCreated={(bot) => {
                        setChatbots((prev) => [bot, ...prev]);
                        setSelectedId(bot.id);
                    }}
                />
            </div>
        </div>
    );
}
