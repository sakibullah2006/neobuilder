"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
    { id: 1, label: "Profile" },
    { id: 2, label: "Organization" },
    { id: 3, label: "Done" },
];

export function StepIndicator({ current }: { current: number }) {
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
