
"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"

export function TeamSwitcher() {
    const { isMobile } = useSidebar()
    const { data: organizations } = authClient.useListOrganizations();
    const { data: activeOrg } = authClient.useActiveOrganization();

    const setActiveOrganization = async (orgId: string) => {
        await authClient.organization.setActive({
            organizationId: orgId
        })
    }

    // Use a default placeholder if no active organization
    const currentOrg = activeOrg || (organizations && organizations.length > 0 ? organizations[0] : null);

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                {/* Placeholder logo logic */}
                                {currentOrg?.logo ? (
                                    <img src={currentOrg.logo} alt={currentOrg.name} className="size-4" />
                                ) : (
                                    <span className="text-xs font-bold">{currentOrg?.name?.charAt(0).toUpperCase() || "O"}</span>
                                )}
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {currentOrg?.name || "Select Organization"}
                                </span>
                                <span className="truncate text-xs">
                                    {currentOrg ? "Free" : "No organization"}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Teams
                        </DropdownMenuLabel>
                        {organizations?.map((org) => (
                            <DropdownMenuItem
                                key={org.id}
                                onClick={() => setActiveOrganization(org.id)}
                                className="gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center rounded-sm border">
                                    {/* Placeholder logo logic */}
                                    {org.logo ? (
                                        <img src={org.logo} alt={org.name} className="size-4" />
                                    ) : (
                                        <span className="text-xs font-bold">{org.name.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                {org.name}
                                {/* <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut> */}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 p-2">
                            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                <Plus className="size-4" />
                            </div>
                            <div className="font-medium text-muted-foreground">Add team</div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
