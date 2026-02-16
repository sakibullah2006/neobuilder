"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Settings, LogOut, User, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button";
import { authClient } from "@/lib/auth-client";

interface Profile {
    name: string;
    email: string;
    avatar?: string | null;
    image?: string | null;
}

interface MenuItem {
    label: string;
    value?: string;
    href?: string;
    icon: React.ReactNode;
    external?: boolean;
    action?: () => void;
}

interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
    user: Profile;
}

export default function ProfileDropdown({
    user,
    className,
    ...props
}: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const router = useRouter();

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/");
                    },
                },
            });
        } catch (error) {
            setIsLoading(false);
        }
    };

    const menuItems: MenuItem[] = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: <User className="w-4 h-4" />,
        },
        {
            label: "Settings",
            href: "/settings",
            icon: <Settings className="w-4 h-4" />,
        },
    ];

    return (
        <div className={cn("relative", className)} {...props}>
            <DropdownMenu onOpenChange={setIsOpen}>
                <div className="group relative">
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="flex cursor-pointer items-center justify-center p-1 hover:bg-accent hover:text-accent-foreground rounded-full border border-border hover:shadow-sm transition-all duration-200 focus:outline-none"
                        >
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-0.5">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-background flex items-center justify-center">
                                        {user.image || user.avatar ? (
                                            <Image
                                                src={user.image || user.avatar || ""}
                                                alt={user.name}
                                                width={36}
                                                height={36}
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        ) : (
                                            <User className="w-5 h-5 text-zinc-400" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-64 p-2 bg-popover/95 backdrop-blur-sm border border-border rounded-2xl shadow-[0px_10px_38px_-10px_rgba(22,23,24,0.35),0px_10px_20px_-15px_rgba(22,23,24,0.2)] dark:shadow-[0px_10px_38px_-10px_rgba(0,0,0,0.8),0px_10px_20px_-15px_rgba(0,0,0,0.6)]
                    data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-top-right"
                    >
                        <div className="flex flex-col px-3 py-2 space-y-1">
                            <p className="text-sm font-medium leading-none text-foreground">{user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                        <DropdownMenuSeparator className="my-3 bg-linear-to-r from-transparent via-border to-transparent" />
                        <div className="space-y-1">
                            {menuItems.map((item) => (
                                <DropdownMenuItem key={item.label} asChild>
                                    {item.href ? (
                                        <Link
                                            href={item.href}
                                            className="flex items-center p-3 hover:bg-accent hover:text-accent-foreground rounded-xl transition-all duration-200 cursor-pointer group hover:shadow-sm border border-transparent hover:border-border"
                                        >
                                            <div className="flex items-center gap-2 flex-1">
                                                {item.icon}
                                                <span className="text-sm font-medium text-foreground tracking-tight leading-tight whitespace-nowrap transition-colors">
                                                    {item.label}
                                                </span>
                                            </div>
                                        </Link>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={item.action}
                                            className="w-full flex items-center p-3 hover:bg-accent hover:text-accent-foreground rounded-xl transition-all duration-200 cursor-pointer group hover:shadow-sm border border-transparent hover:border-border"
                                        >
                                            <div className="flex items-center gap-2 flex-1">
                                                {item.icon}
                                                <span className="text-sm font-medium text-foreground tracking-tight leading-tight whitespace-nowrap transition-colors">
                                                    {item.label}
                                                </span>
                                            </div>
                                        </button>
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </div>

                        <DropdownMenuSeparator className="my-3 bg-linear-to-r from-transparent via-border to-transparent" />

                        <div className="px-3 py-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">Theme</span>
                            <ThemeToggleButton />
                        </div>

                        <DropdownMenuSeparator className="my-3 bg-linear-to-r from-transparent via-border to-transparent" />

                        <DropdownMenuItem asChild>
                            <button
                                type="button"
                                onClick={handleSignOut}
                                disabled={isLoading}
                                className="w-full flex items-center gap-3 p-3 duration-200 rounded-xl hover:bg-destructive/20 cursor-pointer border border-transparent hover:shadow-sm transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 text-destructive animate-spin" />
                                ) : (
                                    <LogOut className="w-4 h-4 text-destructive group-hover:text-destructive" />
                                )}
                                <span className="text-sm font-medium text-destructive group-hover:text-destructive">
                                    {isLoading ? "Logging out..." : "Log Out"}
                                </span>
                            </button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </div>
            </DropdownMenu>
        </div>
    );
}
