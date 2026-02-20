"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Loader2 } from "lucide-react";

interface AddUrlFormProps {
    botId: string;
    onSuccess: () => void;
}

export function AddUrlForm({ botId, onSuccess }: AddUrlFormProps) {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = url.trim();
        if (!trimmed) return;
        try {
            new URL(trimmed); // validate
        } catch {
            toast.error("Please enter a valid URL");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/ingest/url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: trimmed, botId }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error ?? "Failed to ingest URL");
            }
            toast.success("URL added — processing started");
            setUrl("");
            onSuccess();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to add URL");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
                <Label htmlFor="kb-url">Website URL</Label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="kb-url"
                            className="pl-9"
                            type="url"
                            placeholder="https://your-site.com/docs"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <Button type="submit" disabled={loading || !url.trim()}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add URL
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    We&apos;ll crawl the page and extract its content for the assistant.
                </p>
            </div>
        </form>
    );
}
