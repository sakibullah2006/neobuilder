
"use client"

import * as React from "react"
import {
    AudioWaveform,
    BookOpen,
    Bot,
    Command,
    Frame,
    GalleryVerticalEnd,
    Map,
    PieChart,
    Settings2,
    SquareTerminal,
    MessageSquare,
    History,
    Wifi,
    Users,
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
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
            title: "Settings",
            url: "#",
            icon: Settings2,
            isActive: true,
            items: [
                {
                    title: "Knowledge Base",
                    url: "#",
                },
                {
                    title: "Assistant",
                    url: "#",
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
                    url: "#",
                },
                {
                    title: "Subscriptions",
                    url: "#",
                }
            ]
        }
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: session } = authClient.useSession()

    // Fallback user if session is not loaded yet or unavailable (though layout checks for session)
    const user = {
        name: session?.user.name || "User",
        email: session?.user.email || "user@example.com",
        avatar: session?.user.image || "/avatars/shadcn.jpg",
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
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
