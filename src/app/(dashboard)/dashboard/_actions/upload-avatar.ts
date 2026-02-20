"use server";

import { uploadUserAvatar, uploadOrgAvatar } from "@/lib/storage";

/**
 * Upload a user's profile avatar to Supabase and return its public CDN URL.
 * FormData must contain a "file" entry (Blob / File).
 */
export async function uploadUserAvatarAction(
    userId: string,
    formData: FormData,
): Promise<{ publicUrl: string }> {
    const file = formData.get("file") as File | null;
    if (!file) throw new Error("No file provided");
    const { publicUrl } = await uploadUserAvatar(userId, file);
    return { publicUrl };
}

/**
 * Upload an organization's logo to Supabase and return its public CDN URL.
 * FormData must contain a "file" entry (Blob / File).
 */
export async function uploadOrgAvatarAction(
    orgId: string,
    formData: FormData,
): Promise<{ publicUrl: string }> {
    const file = formData.get("file") as File | null;
    if (!file) throw new Error("No file provided");
    const { publicUrl } = await uploadOrgAvatar(orgId, file);
    return { publicUrl };
}
