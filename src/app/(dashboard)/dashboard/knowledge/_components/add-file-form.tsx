"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileUp, Loader2, X, File as FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadAndGetSignedUrl } from "../_actions/knowledge";

const ACCEPTED_MIME_TYPES = [
    // "application/msword",
    // "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    // "text/plain",
    // "text/markdown",
    "application/pdf"
];
const ACCEPTED_EXTENSIONS = ".pdf";
const MAX_SIZE_MB = 20;

interface AddFileFormProps {
    botId: string;
    orgId: string;
    onSuccess: () => void;
}

export function AddFileForm({ botId, orgId, onSuccess }: AddFileFormProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): boolean => {
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            toast.error(`File too large — max ${MAX_SIZE_MB} MB`);
            return false;
        }
        if (
            !ACCEPTED_MIME_TYPES.includes(file.type) &&
            !file.name.match(/\.pdf$/i)
        ) {
            toast.error("Only PDF files are supported");
            return false;
        }
        return true;
    };

    const handleFilePick = (file: File) => {
        if (validateFile(file)) setSelectedFile(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            // 1. Upload to Supabase via server action
            const { signedUrl, fileName, fileType } = await uploadAndGetSignedUrl(orgId, botId, formData);

            // Derive a clean type label
            const typeLabel = fileType.includes("pdf")
                ? "pdf"
                : fileType.includes("word") || fileName.endsWith(".docx")
                    ? "docx"
                    : fileName.endsWith(".doc")
                        ? "doc"
                        : fileName.endsWith(".mdx")
                            ? "mdx"
                            : "txt";

            // 2. Kick off n8n ingest
            const res = await fetch("/api/ingest/file", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    botId,
                    fileName,
                    fileUrl: signedUrl,
                    fileType: typeLabel,
                }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error ?? "Failed to ingest file");
            }

            toast.success(`${fileName} uploaded — processing started`);
            setSelectedFile(null);
            onSuccess();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <Label>File</Label>

            {/* Drop zone */}
            <div
                className={cn(
                    "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
                    dragging ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40",
                )}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (file) handleFilePick(file);
                }}
                onClick={() => inputRef.current?.click()}
            >
                <FileUp className="h-8 w-8 text-muted-foreground" />
                <div className="space-y-1">
                    <p className="text-sm font-medium">
                        Drop file here or <span className="text-primary underline underline-offset-2">browse</span>
                    </p>
                    <p className="text-xs text-muted-foreground">PDF only — max {MAX_SIZE_MB} MB</p>
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_EXTENSIONS}
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFilePick(file);
                        e.target.value = "";
                    }}
                />
            </div>

            {/* Selected file pill */}
            {selectedFile && (
                <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                    <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                        {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            <Button type="submit" disabled={!selectedFile || loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Uploading…" : "Upload & Ingest"}
            </Button>
        </form>
    );
}
