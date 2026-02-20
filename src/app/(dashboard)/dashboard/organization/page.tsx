"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Loader2 } from "lucide-react";
import { OrgProfileSection } from "./_components/org-profile-section";
import { MembersSection } from "./_components/members-section";
import { InvitationsSection } from "./_components/invitations-section";
import { CreateOrganizationDialog } from "./_components/create-organization-dialog";
import { OrgDangerZone } from "./_components/org-danger-zone";

export default function OrganizationSettingsPage() {
    const { data: activeOrg, isPending: orgLoading } =
        authClient.useActiveOrganization();
    const [memberRole, setMemberRole] = useState<string>("member");
    const [roleLoading, setRoleLoading] = useState(false);

    useEffect(() => {
        if (!activeOrg?.id) return;
        let cancelled = false;
        const fetchRole = async () => {
            setRoleLoading(true);
            const { data, error } =
                await authClient.organization.getActiveMember();
            if (!cancelled) {
                if (!error && data) setMemberRole(data.role || "member");
                setRoleLoading(false);
            }
        };
        fetchRole();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeOrg?.id]);

    if (orgLoading || roleLoading) {
        return (
            <div className="flex flex-1 items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Organization Settings
                    </h2>
                    <p className="text-muted-foreground">
                        {activeOrg
                            ? `Manage settings for "${activeOrg.name}".`
                            : "Create or select an organization to get started."}
                    </p>
                </div>
                <CreateOrganizationDialog />
            </div>

            {!activeOrg ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No Active Organization</h3>
                        <p className="text-sm text-muted-foreground mt-2 max-w-md">
                            Create a new organization or switch to an existing one using the
                            team switcher in the sidebar.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    <OrgProfileSection
                        org={activeOrg}
                        memberRole={memberRole}
                    />
                    <MembersSection orgId={activeOrg.id} memberRole={memberRole} />
                    <InvitationsSection orgId={activeOrg.id} memberRole={memberRole} />
                    <OrgDangerZone
                        orgId={activeOrg.id}
                        orgName={activeOrg.name}
                        memberRole={memberRole}
                    />
                </div>
            )}
        </div>
    );
}
