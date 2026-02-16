"use client";

import Link from "next/link";
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button";
import { authClient } from "@/lib/auth-client";
import ProfileDropdown from "@/components/kokonutui/profile-dropdown";
import { Button } from "@/components/ui/button";

export function Header() {
    const { data: session } = authClient.useSession();

    return (
        <header className="fixed top-0 z-50 w-full border-b border-transparent bg-transparent/80 backdrop-blur-sm transition-all duration-300 supports-[backdrop-filter]:bg-transparent/60">
            <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="font-bold">NeoBuilder</span>
                    </Link>
                </div>

                <nav className="flex items-center gap-2">

                </nav>

                <div className="flex items-center gap-4">
                    {session ? (
                        <ProfileDropdown user={session.user} />
                    ) : (
                        <>
                            <ThemeToggleButton />
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/login">Login</Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link href="/signup">Sign Up</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
