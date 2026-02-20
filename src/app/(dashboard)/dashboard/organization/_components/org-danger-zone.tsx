"use client";

import { useState } from "react";
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
import { Shield, Trash2, LogOut, Loader2 } from "lucide-react";

export function OrgDangerZone({
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
