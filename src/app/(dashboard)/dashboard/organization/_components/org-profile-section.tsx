"use client";

import { useState, useRef } from "react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Building2, Camera, Upload, Loader2 } from "lucide-react";
import {
    ImageCrop,
    ImageCropApply,
    ImageCropContent,
    ImageCropReset,
} from "@/components/kibo-ui/image-crop";

export function OrgProfileSection({
    org,
    memberRole,
}: {
    org: { id: string; name: string; slug: string; logo?: string | null };
    memberRole: string;
}) {
    const [name, setName] = useState(org.name);
    const [slug, setSlug] = useState(org.slug);
    const [loading, setLoading] = useState(false);

    // Logo upload state
    const [logoPreview, setLogoPreview] = useState<string | null>(org.logo ?? null);
    const [pendingLogo, setPendingLogo] = useState<string | null>(null);
    const [cropFile, setCropFile] = useState<File | null>(null);
    const [cropOpen, setCropOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const canEdit = memberRole === "owner" || memberRole === "admin";
    const displayLogo = pendingLogo ?? logoPreview;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCropFile(file);
        setCropOpen(true);
        e.target.value = "";
    };

    const handleUpdate = async () => {
        setLoading(true);
        const { error } = await authClient.organization.update({
            data: {
                name,
                slug,
                logo: pendingLogo ?? logoPreview ?? undefined,
            },
            organizationId: org.id,
        });
        setLoading(false);
        if (error) {
            toast.error(error.message || "Failed to update organization");
        } else {
            toast.success("Organization updated");
            if (pendingLogo) {
                setLogoPreview(pendingLogo);
                setPendingLogo(null);
            }
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Organization Profile
                    </CardTitle>
                    <CardDescription>
                        {canEdit
                            ? "Update your organization's details."
                            : "View your organization's details. Only admins and owners can edit."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Logo upload */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            {displayLogo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={displayLogo}
                                    alt="Logo"
                                    className="h-16 w-16 rounded-lg object-cover border"
                                />
                            ) : (
                                <div className="h-16 w-16 rounded-lg bg-muted border-2 border-dashed border-border flex items-center justify-center">
                                    <Building2 className="h-7 w-7 text-muted-foreground" />
                                </div>
                            )}
                            {canEdit && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow hover:bg-primary/90 transition-colors"
                                >
                                    <Camera className="h-3 w-3 text-primary-foreground" />
                                </button>
                            )}
                        </div>
                        {canEdit && (
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Organization logo</p>
                                <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 5 MB.</p>
                                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                                    Upload logo
                                </Button>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/gif,image/webp"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="orgName">Organization Name</Label>
                        <Input
                            id="orgName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={!canEdit}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="orgSlug">Slug</Label>
                        <Input
                            id="orgSlug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            disabled={!canEdit}
                        />
                    </div>
                    {canEdit && (
                        <Button onClick={handleUpdate} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Crop Dialog */}
            <Dialog open={cropOpen} onOpenChange={setCropOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Crop Logo</DialogTitle>
                        <DialogDescription>Adjust the crop area and click Apply.</DialogDescription>
                    </DialogHeader>
                    {cropFile && (
                        <ImageCrop
                            file={cropFile}
                            aspect={1}
                            onCrop={(url) => { setPendingLogo(url); setCropOpen(false); setCropFile(null); }}
                        >
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
