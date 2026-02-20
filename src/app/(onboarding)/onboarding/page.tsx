"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
import {
    User,
    Building2,
    ArrowRight,
    ArrowLeft,
    Camera,
    Loader2,
    Check,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Step indicator ──────────────────────────────────────────────────────────

const STEPS = [
    { id: 1, label: "Profile" },
    { id: 2, label: "Organization" },
    { id: 3, label: "Done" },
];

function StepIndicator({ current }: { current: number }) {
    return (
        <div className="flex items-center justify-center">
            {STEPS.map((step, i) => {
                const isDone = step.id < current;
                const isActive = step.id === current;
                return (
                    <div key={step.id} className="flex items-center">
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
                                    isDone && "bg-primary text-primary-foreground",
                                    isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                                    !isDone && !isActive && "bg-muted text-muted-foreground border border-border"
                                )}
                            >
                                {isDone ? <Check className="h-3.5 w-3.5" /> : step.id}
                            </div>
                            <span className={cn("text-[11px] font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
                                {step.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={cn("h-px w-14 mx-1 mb-5 transition-colors duration-300", step.id < current ? "bg-primary" : "bg-border")} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Step 1: Profile ─────────────────────────────────────────────────────────

function ProfileStep({ onNext }: { onNext: () => void }) {
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

// ─── Step 2: Organization ─────────────────────────────────────────────────────

function OrganizationStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
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

// ─── Step 3: Done ─────────────────────────────────────────────────────────────

function DoneStep() {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const firstName = session?.user?.name?.split(" ")[0] ?? "there";

    useEffect(() => {
        const timer = setTimeout(() => router.push("/dashboard"), 3000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="flex flex-col items-center gap-6 py-2 text-center">
            <div className="relative">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-9 w-9 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                    <Check className="h-3.5 w-3.5 text-white" />
                </div>
            </div>
            <div>
                <h3 className="text-xl font-semibold">You&apos;re all set, {firstName}!</h3>
                <p className="text-sm text-muted-foreground mt-1.5">Redirecting you to your dashboard...</p>
            </div>
            <Button className="w-full" size="lg" onClick={() => router.push("/dashboard")}>
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
    const { data: session, isPending } = authClient.useSession();
    const [step, setStep] = useState<number | null>(null); // null = loading

    // Determine starting step based on existing data — only run once
    useEffect(() => {
        if (isPending || !session?.user || step !== null) return;
        setStep(1);
    }, [isPending, session, step]);

    const stepMeta: Record<number, { title: string; description: string }> = {
        1: { title: "Set up your profile", description: "How should we display your name?" },
        2: { title: "Create your workspace", description: "Organisations help you collaborate with your team." },
        3: { title: "Setup complete 🎉", description: "Everything is ready. Welcome aboard!" },
    };

    if (isPending || step === null) {
        return (
            <div className="min-h-screen bg-dot-pattern flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const { title, description } = stepMeta[step];

    return (
        <div className="min-h-screen bg-dot-pattern flex items-center justify-center p-4">
            <div className="w-full max-w-xl">

                {/* Card */}
                <div className="rounded-2xl border bg-card/80 backdrop-blur-sm shadow-xl p-6 space-y-4">

                    {/* Logo */}
                    <div className="flex justify-center">
                        <div className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center shadow-md">
                            <span className="text-primary-foreground font-bold text-xl">N</span>
                        </div>
                    </div>

                    {/* Steps */}
                    <StepIndicator current={step} />

                    {/* Header */}
                    <div className="text-center space-y-1">
                        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>

                    {/* Content */}
                    {step === 1 && <ProfileStep onNext={() => setStep(2)} />}
                    {step === 2 && <OrganizationStep onNext={() => setStep(3)} onBack={() => setStep(1)} />}
                    {step === 3 && <DoneStep />}
                </div>

                <p className="text-center text-xs text-muted-foreground mt-5">
                    You can update everything later in{" "}
                    <span className="underline underline-offset-2 cursor-pointer">account settings</span>.
                </p>
            </div>
        </div>
    );
}
