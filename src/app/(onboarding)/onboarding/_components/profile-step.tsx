"use client";

import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    ImageCrop,
    ImageCropApply,
    ImageCropContent,
    ImageCropReset,
} from "@/components/kibo-ui/image-crop";
import { User, Camera, Loader2, ArrowRight } from "lucide-react";

export function ProfileStep({ onNext }: { onNext: () => void }) {
    const { data: session } = authClient.useSession();
    const [name, setName] = useState("");
    const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
    const [cropFile, setCropFile] = useState<File | null>(null);
    const [cropOpen, setCropOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Pre-fill from session when loaded
    useEffect(() => {
        if (session?.user) {
            if (session.user.name && !name) setName(session.user.name);
            if (session.user.image && !avatarDataUrl) setAvatarDataUrl(session.user.image);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCropFile(file);
        setCropOpen(true);
        e.target.value = "";
    };

    const handleNext = async () => {
        if (!name.trim()) {
            toast.error("Please enter your name");
            return;
        }
        setLoading(true);
        const { error } = await authClient.updateUser({
            name: name.trim(),
            image: avatarDataUrl ?? undefined,
        });
        setLoading(false);
        if (error) {
            toast.error(error.message || "Failed to save profile");
            return;
        }
        onNext();
    };

    return (
        <>
            <div className="space-y-4">
                {/* Avatar picker */}
                <div className="flex flex-col items-center gap-2">
                    <div className="relative group cursor-pointer w-fit mx-auto" onClick={() => fileInputRef.current?.click()}>
                        {avatarDataUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avatarDataUrl} alt="Avatar" className="h-16 w-16 rounded-full object-cover border-2 border-border shadow-sm" />
                        ) : (
                            <div className="h-16 w-16 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center shadow-sm">
                                <User className="h-7 w-7 text-muted-foreground" />
                            </div>
                        )}
                        <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="h-5 w-5 text-white" />
                        </div>
                        <div className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary border-2 border-background flex items-center justify-center shadow">
                            <Camera className="h-3 w-3 text-primary-foreground" />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Click to upload photo (optional)</p>
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={handleFileChange} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="onboard-name">Display name <span className="text-destructive">*</span></Label>
                    <Input
                        id="onboard-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Smith"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleNext()}
                    />
                </div>

                <Button onClick={handleNext} disabled={loading} className="w-full" size="lg">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Continue
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
            </div>

            <Dialog open={cropOpen} onOpenChange={setCropOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Crop Photo</DialogTitle>
                        <DialogDescription>Adjust the crop area and click Apply.</DialogDescription>
                    </DialogHeader>
                    {cropFile && (
                        <ImageCrop file={cropFile} aspect={1} onCrop={(url) => { setAvatarDataUrl(url); setCropOpen(false); setCropFile(null); }} circularCrop>
                            <div className="flex flex-col items-center gap-4">
                                <ImageCropContent className="w-full" />
                                <DialogFooter className="w-full">
                                    <ImageCropReset asChild><Button variant="outline">Reset</Button></ImageCropReset>
                                    <ImageCropApply asChild><Button>Apply</Button></ImageCropApply>
                                </DialogFooter>
                            </div>
                        </ImageCrop>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
