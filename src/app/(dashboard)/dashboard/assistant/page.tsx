"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Bot, Loader2 } from "lucide-react";
import { getChatbotsForOrg } from "./_actions/assistant";
import { CreateChatbotForm } from "./_components/create-chatbot-form";
import { EditChatbotForm } from "./_components/edit-chatbot-form";

type Chatbot = Awaited<ReturnType<typeof getChatbotsForOrg>>[number];

export default function AssistantPage() {
    const { data: activeOrg, isPending: orgPending } = authClient.useActiveOrganization();
    const [chatbots, setChatbots] = useState<Chatbot[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const loadedForOrg = useRef<string | null>(null);

    const loadBots = useCallback(async (orgId: string) => {
        setLoading(true);
        try {
            const bots = await getChatbotsForOrg(orgId);
            setChatbots(bots);
            setSelectedId((prev) => (prev === null && bots.length > 0 ? bots[0].id : prev));
        } catch {
            toast.error("Failed to load assistants");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Auth hook is still fetching — wait for it
        if (orgPending) return;
        // Auth hook finished but no active org — stop spinner
        if (!activeOrg?.id) {
            setLoading(false);
            return;
        }
        if (loadedForOrg.current === activeOrg.id) return;
        loadedForOrg.current = activeOrg.id;
        loadBots(activeOrg.id);
    }, [activeOrg?.id, orgPending, loadBots]);

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
