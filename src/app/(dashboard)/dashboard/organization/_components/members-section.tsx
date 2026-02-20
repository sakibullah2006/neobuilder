"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Users, Loader2, Crown, UserMinus } from "lucide-react";

interface MemberWithUser {
    id: string;
    userId: string;
    role: string;
    createdAt: Date;
    user: { name: string; email: string; image?: string | null };
}

export function MembersSection({
    orgId,
    memberRole,
}: {
    orgId: string;
    memberRole: string;
}) {
    const [members, setMembers] = useState<MemberWithUser[]>([]);
    const [loading, setLoading] = useState(true);

    const canManage = memberRole === "owner" || memberRole === "admin";

    const fetchMembers = async () => {
        setLoading(true);
        const { data, error } = await authClient.organization.listMembers({
            query: { organizationId: orgId },
        });
        setLoading(false);
        if (!error && data) {
            const list = (data as unknown as { members?: MemberWithUser[] }).members ?? (Array.isArray(data) ? data : []);
            setMembers(list as MemberWithUser[]);
        }
    };

    useEffect(() => {
        fetchMembers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orgId]);

    const handleRoleChange = async (memberId: string, newRole: string) => {
        const { error } = await authClient.organization.updateMemberRole({
            memberId,
            role: newRole,
            organizationId: orgId,
        });
        if (error) {
            toast.error(error.message || "Failed to update role");
        } else {
            toast.success("Role updated");
            fetchMembers();
        }
    };

    const handleRemoveMember = async (memberIdOrEmail: string) => {
        const { error } = await authClient.organization.removeMember({
            memberIdOrEmail,
            organizationId: orgId,
        });
        if (error) {
            toast.error(error.message || "Failed to remove member");
        } else {
            toast.success("Member removed");
            fetchMembers();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Members
                </CardTitle>
                <CardDescription>
                    {members.length} member{members.length !== 1 ? "s" : ""} in this organization.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                                        {member.user.name?.charAt(0).toUpperCase() || "?"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{member.user.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {member.user.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {canManage ? (
                                        <Select
                                            value={member.role}
                                            onValueChange={(val) => handleRoleChange(member.id, val)}
                                        >
                                            <SelectTrigger className="w-[110px] h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="owner">
                                                    <div className="flex items-center gap-1">
                                                        <Crown className="h-3 w-3" /> Owner
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="member">Member</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Badge variant="secondary" className="capitalize">
                                            {member.role}
                                        </Badge>
                                    )}
                                    {canManage && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => handleRemoveMember(member.id)}
                                        >
                                            <UserMinus className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
