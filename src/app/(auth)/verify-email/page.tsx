"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Loader2 } from "lucide-react"

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const router = useRouter()
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

    useEffect(() => {
        if (!token) {
            setStatus("error")
            return
        }

        authClient.verifyEmail({
            query: {
                token
            }
        }, {
            onSuccess: () => {
                setStatus("success")
                router.push("/onboarding")
            },
            onError: () => {
                setStatus("error")
            }
        })
    }, [token, router])

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Verifying your email...</p>
            </div>
        )
    }

    if (status === "success") {
        return (
            <div className="flex flex-col items-center gap-4">
                <div className="text-green-500 font-bold text-lg">Email Verified!</div>
                <p className="text-muted-foreground text-center">
                    Your email has been successfully verified. You can now login.
                </p>
                <Button asChild>
                    <Link href="/login">Go to Login</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="text-red-500 font-bold text-lg">Verification Failed</div>
            <p className="text-muted-foreground text-center">
                The verification link is invalid or has expired.
            </p>
            <Button asChild variant="outline">
                <Link href="/signup">Back to Signup</Link>
            </Button>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Email Verification</CardTitle>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin" /></div>}>
                        <VerifyEmailContent />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}
