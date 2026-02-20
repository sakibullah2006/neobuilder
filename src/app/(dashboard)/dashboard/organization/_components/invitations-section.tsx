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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Mail, Loader2 } from "lucide-react";

interface Invitation {
    id: string;
    email: string;
    role: string | null;
    status: string;
    expiresAt: Date;
}

export function InvitationsSection({
    orgId,
    memberRole,
}: {
    orgId: string;
    memberRole: string;
}) {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");
    const [loading, setLoading] = useState(false);
    const [sendLoading, setSendLoading] = useState(false);

    const canInvite = memberRole === "owner" || memberRole === "admin";

    const fetchInvitations = async () => {
        setLoading(true);
        const { data, error } = await authClient.organization.listInvitations({
            query: { organizationId: orgId },
        });
        setLoading(false);
        if (!error && data) {
            const list = (data as unknown as { invitations?: Invitation[] }).invitations ?? (Array.isArray(data) ? data : []);
            setInvitations(list as Invitation[]);
        }
    };

    useEffect(() => {
        fetchInvitations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orgId]);

    const handleSendInvite = async () => {
        if (!email) {
            toast.error("Please enter an email address");
            return;
        }
        setSendLoading(true);
        const { error } = await authClient.organization.inviteMember({
            email,
            role: role as "member" | "admin" | "owner",
            organizationId: orgId,
        });
        setSendLoading(false);
        if (error) {
            toast.error(error.message || "Failed to send invitation");
        } else {
            toast.success("Invitation sent");
            setEmail("");
            fetchInvitations();
        }
    };

    const handleCancelInvitation = async (invitationId: string) => {
        const { error } = await authClient.organization.cancelInvitation({
            invitationId,
        });
        if (error) {
            toast.error(error.message || "Failed to cancel invitation");
        } else {
            toast.success("Invitation cancelled");
            fetchInvitations();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Invitations
                </CardTitle>
                <CardDescription>
                    Invite new members to your organization via email.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {canInvite && (
                    <>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="inviteEmail">Email Address</Label>
                                <Input
                                    id="inviteEmail"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="user@example.com"
                                />
                            </div>
                            <div className="w-full sm:w-[130px] space-y-2">
                                <Label>Role</Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="owner">Owner</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={handleSendInvite}
                                disabled={sendLoading}
                                className="sm:self-end"
                            >
                                {sendLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Send Invite
                            </Button>
                        </div>
                        <Separator />
                    </>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : invitations.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">
                        No pending invitations.
                    </p>
                ) : (
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium">Pending Invitations</h4>
                        {invitations.map((inv) => (
                            <div
                                key={inv.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                            >
                                <div>
                                    <p className="text-sm font-medium">{inv.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="capitalize text-xs">
                                            {inv.role || "member"}
                                        </Badge>
                                        <Badge
                                            variant={
                                                inv.status === "pending" ? "secondary" : "default"
                                            }
                                            className="text-xs"
                                        >
                                            {inv.status}
                                        </Badge>
                                    </div>
                                </div>
                                {canInvite && inv.status === "pending" && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCancelInvitation(inv.id)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
