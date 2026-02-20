"use client";

import { useState, useRef } from "react";
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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Building2, Camera, Upload, Plus, Loader2 } from "lucide-react";
import {
    ImageCrop,
    ImageCropApply,
    ImageCropContent,
    ImageCropReset,
} from "@/components/kibo-ui/image-crop";

export function CreateOrganizationDialog() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [logo, setLogo] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Logo crop state
    const [cropFile, setCropFile] = useState<File | null>(null);
    const [cropOpen, setCropOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCropFile(file);
        setCropOpen(true);
        e.target.value = "";
    };

    const handleCreate = async () => {
        if (!name || !slug) {
            toast.error("Name and slug are required");
            return;
        }
        setLoading(true);
        const { error } = await authClient.organization.create({
            name,
            slug,
            logo: logo ?? undefined,
        });
        setLoading(false);
        if (error) {
            toast.error(error.message || "Failed to create organization");
        } else {
            toast.success("Organization created");
            setOpen(false);
            setName("");
            setSlug("");
            setLogo(null);
        }
    };

    const handleNameChange = (val: string) => {
        setName(val);
        setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Organization
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Organization</DialogTitle>
                        <DialogDescription>
                            Create a new organization to collaborate with your team.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {/* Logo upload */}
                        <div className="flex items-center gap-4">
                            <div
                                className="relative cursor-pointer group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {logo ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={logo}
                                        alt="Logo"
                                        className="h-14 w-14 rounded-lg object-cover border"
                                    />
                                ) : (
                                    <div className="h-14 w-14 rounded-lg bg-muted border-2 border-dashed border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                                        <Building2 className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow">
                                    <Camera className="h-2.5 w-2.5 text-primary-foreground" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Logo <span className="text-muted-foreground font-normal">(optional)</span></p>
                                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                                    Upload logo
                                </Button>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/gif,image/webp"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="createOrgName">Name</Label>
                            <Input
                                id="createOrgName"
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="My Organization"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="createOrgSlug">Slug</Label>
                            <Input
                                id="createOrgSlug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="my-organization"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Logo crop dialog */}
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
                            onCrop={(url) => { setLogo(url); setCropOpen(false); setCropFile(null); }}
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
