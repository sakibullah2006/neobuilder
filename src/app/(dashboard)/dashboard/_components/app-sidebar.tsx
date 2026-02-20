
"use client"

import * as React from "react"
import {
    LayoutDashboard,
    MessageSquare,
    Settings2,
    Users,
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"

// This is sample data.
const data = {
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
            isActive: true,
        },
        {
            title: "Settings",
            url: "#",
            icon: Settings2,
            items: [
                {
                    title: "Knowledge Base",
                    url: "/dashboard/knowledge",
                },
                {
                    title: "Assistant",
                    url: "/dashboard/assistant",
                },
                {
                    title: "Security",
                    url: "#",
                },
                {
                    title: "Widget",
                    url: "#",
                }
            ],
        },
        {
            title: "Conversations",
            url: "#",
            icon: MessageSquare,
            items: [
                {
                    title: "History",
                    url: "#",
                },
                {
                    title: "Online",
                    url: "#",
                },
            ],
        },
        {
            title: "Account",
            url: "#",
            icon: Users,
            items: [
                {
                    title: "Account Settings",
                    url: "/dashboard/account",
                },
                {
                    title: "Organization",
                    url: "/dashboard/organization",
                }
            ]
        }
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: session } = authClient.useSession()

    // Fallback user if session is not loaded yet or unavailable
    const user = {
        name: session?.user.name || "User",
        email: session?.user.email || "user@example.com",
        avatar: session?.user.image || "/avatars/shadcn.jpg",
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
