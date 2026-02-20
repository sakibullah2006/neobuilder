"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Globe,
    FileText,
    MoreHorizontal,
    Trash2,
    RefreshCw,
    Loader2,
    CheckCircle2,
    XCircle,
    Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getKnowledgeSources } from "../_actions/knowledge";

function timeAgo(date: Date): string {
    const secs = Math.floor((Date.now() - date.getTime()) / 1000);
    if (secs < 60) return "just now";
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
}

type Source = Awaited<ReturnType<typeof getKnowledgeSources>>[number];

interface KnowledgeTableProps {
    botId: string;
    refreshKey: number;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
    url: <Globe className="h-3.5 w-3.5" />,
};
const getTypeIcon = (type: string) =>
    TYPE_ICON[type] ?? <FileText className="h-3.5 w-3.5" />;

const STATUS_CONFIG = {
    processing: {
        label: "Processing",
        dot: "bg-amber-400 animate-pulse",
        text: "text-amber-600 dark:text-amber-400",
        icon: <Loader2 className="h-2.5 w-2.5 animate-spin" />,
    },
    ready: {
        label: "Ready",
        dot: "bg-emerald-500",
        text: "text-emerald-600 dark:text-emerald-400",
        icon: <CheckCircle2 className="h-2.5 w-2.5" />,
    },
    error: {
        label: "Error",
        dot: "bg-destructive",
        text: "text-destructive",
        icon: <XCircle className="h-2.5 w-2.5" />,
    },
} as const;

export function KnowledgeTable({ botId, refreshKey }: KnowledgeTableProps) {
    const [sources, setSources] = useState<Source[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [refeedingId, setRefeedingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const fetchSources = useCallback(async () => {
        const data = await getKnowledgeSources(botId);
        setSources(data);
        setLoading(false);
        return data;
    }, [botId]);

    const fetchSourcesRef = useRef(fetchSources);
    useEffect(() => { fetchSourcesRef.current = fetchSources; }, [fetchSources]);

    useEffect(() => {
        setLoading(true);
        fetchSources();
    }, [fetchSources, refreshKey]);

    useEffect(() => {
        const hasProcessing = sources.some((s) => s.status === "processing");
        if (!hasProcessing) return;
        const id = setInterval(async () => {
            const updated = await fetchSourcesRef.current();
            if (!updated.some((s) => s.status === "processing")) clearInterval(id);
        }, 5000);
        return () => clearInterval(id);
    }, [sources]); // fetchSources intentionally excluded — using ref to avoid double-fetch

    const handleDelete = async (sourceId: string) => {
        setDeletingId(sourceId);
        try {
            const res = await fetch(`/api/ingest/delete?sourceId=${sourceId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Source deleted");
            setSources((prev) => prev.filter((s) => s.id !== sourceId));
        } catch {
            toast.error("Failed to delete source");
        } finally {
            setDeletingId(null);
            setConfirmDeleteId(null);
        }
    };

    const handleRefeed = async (sourceId: string) => {
        setRefeedingId(sourceId);
        try {
            const res = await fetch("/api/ingest/refeed", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sourceId }),
            });
            if (!res.ok) throw new Error("Failed to re-feed");
            toast.success("Re-processing started");
            setSources((prev) =>
                prev.map((s) => (s.id === sourceId ? { ...s, status: "processing" } : s)),
            );
        } catch {
            toast.error("Failed to re-feed source");
        } finally {
            setRefeedingId(null);
        }
    };

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading sources…</span>
            </div>
        );
    }

    // ── Empty ──────────────────────────────────────────────────────────────────
    if (sources.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Database className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-sm font-medium">No sources yet</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Add a URL or upload a file above to get started.
                    </p>
                </div>
            </div>
        );
    }

    // ── Table ──────────────────────────────────────────────────────────────────
    return (
        <>
            {/* Column header */}
            <div className="grid grid-cols-[auto_1fr_80px_110px_80px_40px] items-center gap-x-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                <span>{/* icon */}</span>
                <span>Source</span>
                <span>Type</span>
                <span>Status</span>
                <span>Added</span>
                <span>{/* actions */}</span>
            </div>

            <div className="divide-y">
                {sources.map((source) => {
                    const isUrl = source.type === "url";
                    const status = STATUS_CONFIG[source.status] ?? STATUS_CONFIG.error;
                    const isBusy = deletingId === source.id || refeedingId === source.id;

                    return (
                        <div
                            key={source.id}
                            className={cn(
                                "grid grid-cols-[auto_1fr_80px_110px_80px_40px] items-center gap-x-4 px-4 py-3 text-sm transition-colors hover:bg-muted/40",
                                isBusy && "opacity-60",
                            )}
                        >
                            {/* Icon */}
                            <span className="text-muted-foreground">
                                {getTypeIcon(source.type)}
                            </span>

                            {/* Name */}
                            <span className="truncate font-medium" title={source.fileName}>
                                {source.fileName}
                            </span>

                            {/* Type badge */}
                            <Badge variant="outline" className="font-mono text-[10px] w-fit uppercase tracking-wide px-1.5 py-0">
                                {source.type}
                            </Badge>

                            {/* Status */}
                            <span className={cn("flex items-center gap-1.5 text-xs font-medium", status.text)}>
                                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", status.dot)} />
                                {status.label}
                            </span>

                            {/* Time */}
                            <span className="text-xs text-muted-foreground">
                                {timeAgo(new Date(source.createdAt))}
                            </span>

                            {/* Actions */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isBusy}>
                                        {isBusy ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                    {isUrl && (
                                        <>
                                            <DropdownMenuItem
                                                onClick={() => handleRefeed(source.id)}
                                                disabled={source.status === "processing"}
                                            >
                                                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                                                Re-feed
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                        </>
                                    )}
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => setConfirmDeleteId(source.id)}
                                    >
                                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                })}
            </div>

            {/* Count footer */}
            <div className="border-t px-4 py-2.5 text-xs text-muted-foreground">
                {sources.length} source{sources.length !== 1 ? "s" : ""}
            </div>

            {/* Delete confirmation */}
            <AlertDialog
                open={!!confirmDeleteId}
                onOpenChange={(open) => !open && setConfirmDeleteId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this source?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This permanently removes the knowledge source and all its indexed
                            vector chunks. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
