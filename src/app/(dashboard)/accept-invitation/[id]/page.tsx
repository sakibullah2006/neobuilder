"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function AcceptInvitationPage() {
    const params = useParams();
    const router = useRouter();
    const invitationId = params.id as string;

    const [status, setStatus] = useState<"loading" | "success" | "error">(
        "loading"
    );
    const [message, setMessage] = useState("");

    useEffect(() => {
        const acceptInvitation = async () => {
            const { data, error } = await authClient.organization.acceptInvitation({
                invitationId,
            });

            if (error) {
                setStatus("error");
                setMessage(error.message || "Failed to accept invitation");
            } else {
                setStatus("success");
                setMessage("You have been added to the organization!");
            }
        };

        if (invitationId) {
            acceptInvitation();
        }
    }, [invitationId]);

    return (
        <div className="flex min-h-[60vh] items-center justify-center p-8">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle>
                        {status === "loading" && "Accepting Invitation..."}
                        {status === "success" && "Invitation Accepted!"}
                        {status === "error" && "Invitation Failed"}
                    </CardTitle>
                    <CardDescription>{message}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    {status === "loading" && (
                        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                    )}
                    {status === "success" && (
                        <>
                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                            <Button onClick={() => router.push("/dashboard")}>
                                Go to Dashboard
                            </Button>
                        </>
                    )}
                    {status === "error" && (
                        <>
                            <XCircle className="h-10 w-10 text-destructive" />
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push("/dashboard")}
                                >
                                    Go to Dashboard
                                </Button>
                                <Button onClick={() => window.location.reload()}>
                                    Try Again
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
