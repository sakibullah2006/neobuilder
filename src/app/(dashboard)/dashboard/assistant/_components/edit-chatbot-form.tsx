"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Settings2, Loader2, Check } from "lucide-react";
import { getChatbotsForOrg, updateChatbot } from "../_actions/assistant";

type Chatbot = Awaited<ReturnType<typeof getChatbotsForOrg>>[number];

interface EditChatbotFormProps {
    bot: Chatbot;
    onUpdated: (bot: Chatbot) => void;
}

export function EditChatbotForm({ bot, onUpdated }: EditChatbotFormProps) {
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
                <CardDescription>Configure your assistant&apos;s settings.</CardDescription>
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
                        Defines the assistant&apos;s personality and instruction set.
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
