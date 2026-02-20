"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ArrowLeft, Loader2 } from "lucide-react";

export function OrganizationStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
    const [orgName, setOrgName] = useState("");
    const [orgSlug, setOrgSlug] = useState("");
    const [loading, setLoading] = useState(false);

    const handleOrgNameChange = (val: string) => {
        setOrgName(val);
        setOrgSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    };

    const handleCreate = async () => {
        if (!orgName.trim() || !orgSlug.trim()) {
            toast.error("Organization name and slug are required");
            return;
        }
        setLoading(true);
        const { error } = await authClient.organization.create({ name: orgName.trim(), slug: orgSlug.trim() });
        setLoading(false);
        if (error) {
            toast.error(error.message || "Failed to create organization");
            return;
        }
        onNext();
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="onboard-org-name">Organization name</Label>
                <Input
                    id="onboard-org-name"
                    value={orgName}
                    onChange={(e) => handleOrgNameChange(e.target.value)}
                    placeholder="Acme Inc."
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="onboard-org-slug">Slug</Label>
                <div className="flex items-center rounded-md border focus-within:ring-1 focus-within:ring-ring overflow-hidden bg-background">
                    <span className="px-3 py-2 text-sm text-muted-foreground bg-muted border-r select-none">/</span>
                    <input
                        id="onboard-org-slug"
                        value={orgSlug}
                        onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="acme-inc"
                        className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
                    />
                </div>
                <p className="text-xs text-muted-foreground">Lowercase letters, numbers and hyphens only.</p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
                <Button onClick={handleCreate} disabled={loading} size="lg" className="w-full">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Building2 className="mr-2 h-4 w-4" />}
                    Create Organization
                </Button>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={onBack} disabled={loading}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button variant="ghost" onClick={onNext} disabled={loading} className="text-muted-foreground">
                        Skip for now
                    </Button>
                </div>
            </div>
        </div>
    );
}
