"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Brain, Globe, FileUp, RefreshCw, Loader2 } from "lucide-react";
import { NoChatbotPlaceholder } from "./_components/no-chatbot-placeholder";
import { AddUrlForm } from "./_components/add-url-form";
import { AddFileForm } from "./_components/add-file-form";
import { KnowledgeTable } from "./_components/knowledge-table";
import { getChatbotsForOrg } from "./_actions/knowledge";

type Chatbot = Awaited<ReturnType<typeof getChatbotsForOrg>>[number];

export default function KnowledgePage() {
    const { data: activeOrg, isPending: orgPending } = authClient.useActiveOrganization();

    const [chatbots, setChatbots] = useState<Chatbot[]>([]);
    const [selectedBotId, setSelectedBotId] = useState<string>("");
    const [botsLoading, setBotsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    // Track which org we last fetched for so auth-hook re-renders don't re-fire
    const loadedForOrg = useRef<string | null>(null);

    const loadChatbots = useCallback(async (orgId: string) => {
        setBotsLoading(true);
        try {
            const bots = await getChatbotsForOrg(orgId);
            setChatbots(bots);
            setSelectedBotId((prev) => (prev === "" && bots.length > 0 ? bots[0].id : prev));
        } catch {
            toast.error("Failed to load chatbots");
        } finally {
            setBotsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Auth hook is still fetching — wait for it
        if (orgPending) return;
        // Auth hook finished but no active org — stop spinner
        if (!activeOrg?.id) {
            setBotsLoading(false);
            return;
        }
        if (loadedForOrg.current === activeOrg.id) return; // already fetched
        loadedForOrg.current = activeOrg.id;
        loadChatbots(activeOrg.id);
    }, [activeOrg?.id, orgPending, loadChatbots]);

    const handleSourceAdded = () => setRefreshKey((k) => k + 1);

    if (botsLoading) {
        return (
            <div className="flex flex-1 items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const selectedBot = chatbots.find((b) => b.id === selectedBotId);

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Brain className="h-7 w-7" />
                        Knowledge Base
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Feed your AI assistant with URLs and documents.
                    </p>
                </div>
                {chatbots.length > 0 && (
                    <Button variant="outline" size="sm" onClick={handleSourceAdded}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                )}
            </div>

            <Separator />

            {/* Guard: no chatbot */}
            {chatbots.length === 0 ? (
                <NoChatbotPlaceholder />
            ) : (
                <div className="space-y-6">
                    {/* Bot selector (only when more than one) */}
                    {chatbots.length > 1 && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">Assistant:</span>
                            <Select value={selectedBotId} onValueChange={setSelectedBotId}>
                                <SelectTrigger className="w-[220px]">
                                    <SelectValue placeholder="Select assistant" />
                                </SelectTrigger>
                                <SelectContent>
                                    {chatbots.map((bot) => (
                                        <SelectItem key={bot.id} value={bot.id}>
                                            {bot.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {selectedBot && (
                        <>
                            {/* Add Knowledge */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <p className="text-sm font-medium">
                                            Add knowledge to{" "}
                                            <span className="text-primary">{selectedBot.name}</span>
                                        </p>
                                    </div>
                                    <Tabs defaultValue="url">
                                        <TabsList className="mb-4">
                                            <TabsTrigger value="url" className="gap-1.5">
                                                <Globe className="h-3.5 w-3.5" />
                                                URL
                                            </TabsTrigger>
                                            <TabsTrigger value="file" className="gap-1.5">
                                                <FileUp className="h-3.5 w-3.5" />
                                                File
                                            </TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="url">
                                            <AddUrlForm
                                                botId={selectedBotId}
                                                onSuccess={handleSourceAdded}
                                            />
                                        </TabsContent>
                                        <TabsContent value="file">
                                            <AddFileForm
                                                botId={selectedBotId}
                                                orgId={activeOrg!.id}
                                                onSuccess={handleSourceAdded}
                                            />
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>

                            {/* Sources list — flat bordered section, no card wrapper */}
                            <div className="rounded-lg border overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                                    <p className="text-sm font-medium">Knowledge Sources</p>
                                </div>
                                <KnowledgeTable
                                    botId={selectedBotId}
                                    refreshKey={refreshKey}
                                />
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
