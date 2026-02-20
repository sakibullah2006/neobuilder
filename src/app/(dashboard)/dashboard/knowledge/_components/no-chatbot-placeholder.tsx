"use client";

import Link from "next/link";
import { Bot, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function NoChatbotPlaceholder() {
    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center gap-5">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Bot className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                    <h3 className="text-lg font-semibold">No assistant found</h3>
                    <p className="text-sm text-muted-foreground">
                        You need to create an AI assistant before you can add knowledge sources. Head to the
                        Assistant page to get started.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/assistant">
                        Go to Assistant <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
