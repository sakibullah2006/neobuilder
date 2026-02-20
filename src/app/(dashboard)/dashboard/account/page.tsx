"use client";

import { useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    ImageCrop,
    ImageCropApply,
    ImageCropContent,
    ImageCropReset,
} from "@/components/kibo-ui/image-crop";
import {
    User,
    Mail,
    Lock,
    Monitor,
    Trash2,
    Loader2,
    Shield,
    Camera,
    Upload,
} from "lucide-react";

// ─── Profile Tab ────────────────────────────────────────────────────────────────

function ProfileSection() {
    const { data: session } = authClient.useSession();
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    // Avatar state
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [cropFile, setCropFile] = useState<File | null>(null);
    const [cropOpen, setCropOpen] = useState(false);
    const [pendingCrop, setPendingCrop] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentName = name !== "" ? name : (session?.user?.name ?? "");
    const displayAvatar = pendingCrop ?? avatarPreview ?? session?.user?.image ?? null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCropFile(file);
        setCropOpen(true);
        // reset input so same file can be picked again
        e.target.value = "";
    };

    const handleCropApply = (croppedDataUrl: string) => {
        setPendingCrop(croppedDataUrl);
        setCropOpen(false);
        setCropFile(null);
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        const { error } = await authClient.updateUser({
            name: currentName,
            image: pendingCrop ?? avatarPreview ?? session?.user?.image ?? undefined,
        });
        setLoading(false);
        if (error) {
            toast.error(error.message || "Failed to update profile");
        } else {
            toast.success("Profile updated successfully");
            if (pendingCrop) {
                setAvatarPreview(pendingCrop);
                setPendingCrop(null);
            }
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Information
                    </CardTitle>
                    <CardDescription>
                        Update your display name and profile picture.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            {displayAvatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={displayAvatar}
                                    alt="Avatar"
                                    className="h-20 w-20 rounded-full object-cover border"
                                />
                            ) : (
                                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border">
                                    <User className="h-8 w-8 text-muted-foreground" />
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow hover:bg-primary/90 transition-colors"
                            >
                                <Camera className="h-3.5 w-3.5 text-primary-foreground" />
                            </button>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Profile picture</p>
                            <p className="text-xs text-muted-foreground">
                                JPG, PNG or GIF. Max 1.2 MB.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="mr-1.5 h-3.5 w-3.5" />
                                Upload photo
                            </Button>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/gif,image/webp"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input
                            id="name"
                            value={currentName}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Email</Label>
                        <p className="text-sm text-muted-foreground">
                            {session?.user?.email ?? "Loading..."}
                        </p>
                    </div>

                    <Button onClick={handleUpdateProfile} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardContent>
            </Card>

            {/* Crop Dialog */}
            <Dialog open={cropOpen} onOpenChange={setCropOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Crop Profile Picture</DialogTitle>
                        <DialogDescription>
                            Drag to adjust the crop area, then click Apply.
                        </DialogDescription>
                    </DialogHeader>
                    {cropFile && (
                        <ImageCrop
                            file={cropFile}
                            aspect={1}
                            onCrop={handleCropApply}
                            circularCrop
                        >
                            <div className="flex flex-col items-center gap-4">
                                <ImageCropContent className="w-full" />
                                <DialogFooter className="w-full">
                                    <ImageCropReset asChild>
                                        <Button variant="outline">Reset</Button>
                                    </ImageCropReset>
                                    <ImageCropApply asChild>
                                        <Button>Apply Crop</Button>
                                    </ImageCropApply>
                                </DialogFooter>
                            </div>
                        </ImageCrop>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

// ─── Email Tab ──────────────────────────────────────────────────────────────────

function EmailSection() {
    const { data: session } = authClient.useSession();
    const [newEmail, setNewEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChangeEmail = async () => {
        if (!newEmail) {
            toast.error("Please enter a new email address");
            return;
        }
        setLoading(true);
        const { error } = await authClient.changeEmail({
            newEmail,
            callbackURL: "/dashboard/account",
        });
        setLoading(false);
        if (error) {
            toast.error(error.message || "Failed to change email");
        } else {
            toast.success("Verification email sent to your new address");
            setNewEmail("");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Address
                </CardTitle>
                <CardDescription>
                    Change the email address associated with your account. A verification
                    email will be sent to the new address.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Current Email</Label>
                    <p className="text-sm text-muted-foreground">
                        {session?.user?.email || "Loading..."}
                    </p>
                </div>
                <Separator />
                <div className="space-y-2">
                    <Label htmlFor="newEmail">New Email Address</Label>
                    <Input
                        id="newEmail"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="new@example.com"
                    />
                </div>
                <Button onClick={handleChangeEmail} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Change Email
                </Button>
            </CardContent>
        </Card>
    );
}

// ─── Password Tab ───────────────────────────────────────────────────────────────

function PasswordSection() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            toast.error("Please fill in all fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }
        setLoading(true);
        const { error } = await authClient.changePassword({
            currentPassword,
            newPassword,
            revokeOtherSessions: false,
        });
        setLoading(false);
        if (error) {
            toast.error(error.message || "Failed to change password");
        } else {
            toast.success("Password changed successfully");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Change Password
                </CardTitle>
                <CardDescription>
                    Update your password. You&apos;ll need your current password to make
                    changes.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                </div>
                <Button onClick={handleChangePassword} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                </Button>
            </CardContent>
        </Card>
    );
}

// ─── Sessions Tab ───────────────────────────────────────────────────────────────

function SessionsSection() {
    const [sessions, setSessions] = useState<
        {
            id: string;
            token: string;
            userAgent?: string | null;
            ipAddress?: string | null;
            createdAt: Date;
        }[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);

    const fetchSessions = async () => {
        setLoading(true);
        const { data, error } = await authClient.listSessions();
        setLoading(false);
        if (error) {
            toast.error("Failed to load sessions");
        } else {
            setSessions(data || []);
            setFetched(true);
        }
    };

    const revokeSession = async (token: string) => {
        const { error } = await authClient.revokeSession({ token });
        if (error) {
            toast.error("Failed to revoke session");
        } else {
            toast.success("Session revoked");
            setSessions((prev) => prev.filter((s) => s.token !== token));
        }
    };

    const revokeAllOther = async () => {
        const { error } = await authClient.revokeOtherSessions();
        if (error) {
            toast.error("Failed to revoke sessions");
        } else {
            toast.success("All other sessions revoked");
            fetchSessions();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Active Sessions
                </CardTitle>
                <CardDescription>
                    Manage your active sessions across devices. Revoke any sessions you
                    don&apos;t recognise.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!fetched ? (
                    <Button onClick={fetchSessions} disabled={loading} variant="outline">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Load Sessions
                    </Button>
                ) : (
                    <>
                        <div className="space-y-3">
                            {sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            {session.userAgent
                                                ? session.userAgent.substring(0, 60) + "..."
                                                : "Unknown device"}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{session.ipAddress || "Unknown IP"}</span>
                                            <span>·</span>
                                            <span>
                                                {new Date(session.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => revokeSession(session.token)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        Revoke
                                    </Button>
                                </div>
                            ))}
                            {sessions.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No active sessions found.
                                </p>
                            )}
                        </div>
                        {sessions.length > 1 && (
                            <Button variant="outline" onClick={revokeAllOther}>
                                Revoke All Other Sessions
                            </Button>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Danger Zone ────────────────────────────────────────────────────────────────

function DangerZoneSection() {
    const [loading, setLoading] = useState(false);

    const handleDeleteAccount = async () => {
        setLoading(true);
        const { error } = await authClient.deleteUser();
        setLoading(false);
        if (error) {
            toast.error(error.message || "Failed to delete account");
        } else {
            toast.success("Account deleted");
            window.location.href = "/login";
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
                    Permanently delete your account and all associated data. This action
                    cannot be undone.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Account
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete your account, all your data,
                                organizations, and memberships. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteAccount}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Yes, delete my account
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function AccountSettingsPage() {
    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                    <TabsTrigger value="sessions">Sessions</TabsTrigger>
                    <TabsTrigger value="danger">Danger Zone</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <ProfileSection />
                </TabsContent>
                <TabsContent value="email">
                    <EmailSection />
                </TabsContent>
                <TabsContent value="password">
                    <PasswordSection />
                </TabsContent>
                <TabsContent value="sessions">
                    <SessionsSection />
                </TabsContent>
                <TabsContent value="danger">
                    <DangerZoneSection />
                </TabsContent>
            </Tabs>
        </div>
    );
}
