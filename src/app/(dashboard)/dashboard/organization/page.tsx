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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Building2,
    Users,
    Mail,
    Plus,
    Trash2,
    LogOut,
    Loader2,
    Shield,
    UserMinus,
    Crown,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface MemberWithUser {
    id: string;
    userId: string;
    role: string;
    createdAt: Date;
    user: { name: string; email: string; image?: string | null };
}

interface Invitation {
    id: string;
    email: string;
    role: string | null;
    status: string;
    expiresAt: Date;
}

// ─── Organization Profile ───────────────────────────────────────────────────────

function OrgProfileSection({
    org,
    memberRole,
}: {
    org: { id: string; name: string; slug: string; logo?: string | null };
    memberRole: string;
}) {
    const [name, setName] = useState(org.name);
    const [slug, setSlug] = useState(org.slug);
    const [logo, setLogo] = useState(org.logo || "");
    const [loading, setLoading] = useState(false);

    const canEdit = memberRole === "owner" || memberRole === "admin";

    const handleUpdate = async () => {
        setLoading(true);
        const { error } = await authClient.organization.update({
            data: { name, slug, logo: logo || undefined },
            organizationId: org.id,
        });
        setLoading(false);
        if (error) {
            toast.error(error.message || "Failed to update organization");
        } else {
            toast.success("Organization updated");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Organization Profile
                </CardTitle>
                <CardDescription>
                    {canEdit
                        ? "Update your organization's details."
                        : "View your organization's details. Only admins and owners can edit."}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input
                        id="orgName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={!canEdit}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="orgSlug">Slug</Label>
                    <Input
                        id="orgSlug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        disabled={!canEdit}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="orgLogo">Logo URL</Label>
                    <Input
                        id="orgLogo"
                        value={logo}
                        onChange={(e) => setLogo(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        disabled={!canEdit}
                    />
                </div>
                {canEdit && (
                    <Button onClick={handleUpdate} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Members Section ────────────────────────────────────────────────────────────

function MembersSection({
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
            setMembers(data as unknown as MemberWithUser[]);
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

// ─── Invitations Section ────────────────────────────────────────────────────────

function InvitationsSection({
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
            setInvitations(data as unknown as Invitation[]);
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

// ─── Create Organization Dialog ─────────────────────────────────────────────────

function CreateOrganizationDialog() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [logo, setLogo] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name || !slug) {
            toast.error("Name and slug are required");
            return;
        }
        setLoading(true);
        const { error } = await authClient.organization.create({
            name,
            slug,
            logo: logo || undefined,
        });
        setLoading(false);
        if (error) {
            toast.error(error.message || "Failed to create organization");
        } else {
            toast.success("Organization created");
            setOpen(false);
            setName("");
            setSlug("");
            setLogo("");
        }
    };

    // Auto-generate slug from name
    const handleNameChange = (val: string) => {
        setName(val);
        setSlug(
            val
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "")
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Organization
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Organization</DialogTitle>
                    <DialogDescription>
                        Create a new organization to collaborate with your team.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="createOrgName">Name</Label>
                        <Input
                            id="createOrgName"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="My Organization"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="createOrgSlug">Slug</Label>
                        <Input
                            id="createOrgSlug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="my-organization"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="createOrgLogo">Logo URL (optional)</Label>
                        <Input
                            id="createOrgLogo"
                            value={logo}
                            onChange={(e) => setLogo(e.target.value)}
                            placeholder="https://example.com/logo.png"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Danger Zone ────────────────────────────────────────────────────────────────

function OrgDangerZone({
    orgId,
    orgName,
    memberRole,
}: {
    orgId: string;
    orgName: string;
    memberRole: string;
}) {
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [leaveLoading, setLeaveLoading] = useState(false);

    const isOwner = memberRole === "owner";

    const handleDelete = async () => {
        setDeleteLoading(true);
        const { error } = await authClient.organization.delete({
            organizationId: orgId,
        });
        setDeleteLoading(false);
        if (error) {
            toast.error(error.message || "Failed to delete organization");
        } else {
            toast.success("Organization deleted");
            window.location.reload();
        }
    };

    const handleLeave = async () => {
        setLeaveLoading(true);
        const { error } = await authClient.organization.leave({
            organizationId: orgId,
        });
        setLeaveLoading(false);
        if (error) {
            toast.error(error.message || "Failed to leave organization");
        } else {
            toast.success("You left the organization");
            window.location.reload();
        }
    };

    return (
        <Card className="border-destructive/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <Shield className="h-5 w-5" />
                    Danger Zone
                </CardTitle>
                <CardDescription>
                    {isOwner
                        ? "Delete this organization and all its data permanently."
                        : "Leave this organization."}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
                {!isOwner && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" disabled={leaveLoading}>
                                {leaveLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                <LogOut className="mr-2 h-4 w-4" />
                                Leave Organization
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Leave &quot;{orgName}&quot;?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You will no longer have access to this organization&apos;s
                                    resources. You&apos;ll need a new invitation to rejoin.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleLeave}>
                                    Leave
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}

                {isOwner && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={deleteLoading}>
                                {deleteLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Organization
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete &quot;{orgName}&quot;?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the organization, all members,
                                    invitations, and associated data. This action cannot be
                                    undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Yes, delete organization
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function OrganizationSettingsPage() {
    const { data: activeOrg, isPending: orgLoading } =
        authClient.useActiveOrganization();
    const [memberRole, setMemberRole] = useState<string>("member");
    const [roleLoading, setRoleLoading] = useState(true);

    useEffect(() => {
        const fetchRole = async () => {
            if (!activeOrg) return;
            setRoleLoading(true);
            const { data, error } =
                await authClient.organization.getActiveMember();
            if (!error && data) {
                setMemberRole(data.role || "member");
            }
            setRoleLoading(false);
        };
        fetchRole();
    }, [activeOrg]);

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
