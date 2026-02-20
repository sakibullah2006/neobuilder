"use client";

import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { StepIndicator } from "./_components/step-indicator";
import { ProfileStep } from "./_components/profile-step";
import { OrganizationStep } from "./_components/organization-step";
import { DoneStep } from "./_components/done-step";

export default function OnboardingPage() {
    const { data: session, isPending } = authClient.useSession();
    const [step, setStep] = useState<number | null>(null); // null = loading
    const stepInitialized = useRef(false);

    // Determine starting step — only run once using a ref flag
    useEffect(() => {
        if (stepInitialized.current || isPending || !session?.user) return;
        stepInitialized.current = true;
        setStep(1);
    }, [isPending, session]);

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
