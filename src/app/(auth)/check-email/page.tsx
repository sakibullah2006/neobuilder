import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CheckEmailPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Check your email</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 text-center">
                    <p className="text-muted-foreground">
                        We&apos;ve sent a verification link to your email address.
                        Please check your inbox and click the link to verify your account.
                    </p>
                    <div className="flex flex-col gap-2">
                        <Button asChild variant="outline">
                            <Link href="/login">Back to Login</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
