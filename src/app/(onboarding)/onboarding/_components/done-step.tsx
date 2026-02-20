"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, ArrowRight } from "lucide-react";

export function DoneStep() {
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
