

import { supabaseAdmin } from "./supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
type FileObject = Awaited<ReturnType<ReturnType<SupabaseClient["storage"]["from"]>["list"]>>["data"] extends (infer T)[] | null ? T : never;

// ─── Bucket names ────────────────────────────────────────────────────────────
const TRAINING_BUCKET = "training-data";
const AVATARS_BUCKET = "avatars";

// ─── Path helpers ─────────────────────────────────────────────────────────────
const paths = {
    training: (orgId: string, botId: string, fileName: string) =>
        `${orgId}/${botId}/${fileName}`,
    userAvatar: (userId: string, fileName: string) =>
        `users/${userId}/${fileName}`,
    orgAvatar: (orgId: string, fileName: string) =>
        `orgs/${orgId}/${fileName}`,
    botAvatar: (userId: string, botId: string, fileName: string) =>
        `bots/${userId}/${botId}/${fileName}`,
};

// ─── Typed error ──────────────────────────────────────────────────────────────
export class StorageError extends Error {
    constructor(
        message: string,
        public readonly cause?: string,
    ) {
        super(message);
        this.name = "StorageError";
    }
}

function assertSuccess(error: { message: string } | null, context: string) {
    if (error) throw new StorageError(`[${context}] ${error.message}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// TRAINING DATA BUCKET  (private, org-scoped)
// Path: training-data/{org_id}/{bot_id}/{fileName}
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Upload a training file for a specific bot.
 * Overwrites existing file with the same name.
 */
export async function uploadTrainingFile(
    orgId: string,
    botId: string,
    file: File,
): Promise<{ path: string }> {
    const path = paths.training(orgId, botId, file.name);
    const { data, error } = await supabaseAdmin.storage
        .from(TRAINING_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });

    assertSuccess(error, "uploadTrainingFile");
    return { path: data!.path };
}

/**
 * Delete a specific training file.
 */
export async function deleteTrainingFile(
    orgId: string,
    botId: string,
    fileName: string,
): Promise<void> {
    const path = paths.training(orgId, botId, fileName);
    const { error } = await supabaseAdmin.storage
        .from(TRAINING_BUCKET)
        .remove([path]);

    assertSuccess(error, "deleteTrainingFile");
}

/**
 * List all training files for a given bot.
 */
export async function listTrainingFiles(
    orgId: string,
    botId: string,
): Promise<FileObject[]> {
    const { data, error } = await supabaseAdmin.storage
        .from(TRAINING_BUCKET)
        .list(`${orgId}/${botId}`, {
            limit: 200,
            sortBy: { column: "created_at", order: "desc" },
        });

    assertSuccess(error, "listTrainingFiles");
    return data ?? [];
}

/**
 * Generate a short-lived signed URL for a private training file.
 * Default expiry: 3600 seconds (1 hour).
 */
export async function getTrainingFileUrl(
    orgId: string,
    botId: string,
    fileName: string,
    expiresIn = 3600,
): Promise<{ signedUrl: string }> {
    const path = paths.training(orgId, botId, fileName);
    const { data, error } = await supabaseAdmin.storage
        .from(TRAINING_BUCKET)
        .createSignedUrl(path, expiresIn);

    assertSuccess(error, "getTrainingFileUrl");
    return { signedUrl: data!.signedUrl };
}

// ─────────────────────────────────────────────────────────────────────────────
// AVATARS BUCKET  (public)
// ─────────────────────────────────────────────────────────────────────────────

function getAvatarPublicUrl(path: string): string {
    const { data } = supabaseAdmin.storage
        .from(AVATARS_BUCKET)
        .getPublicUrl(path);
    return data.publicUrl;
}

async function uploadAvatar(
    path: string,
    file: File,
): Promise<{ path: string; publicUrl: string }> {
    const { data, error } = await supabaseAdmin.storage
        .from(AVATARS_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });

    assertSuccess(error, "uploadAvatar");
    return { path: data!.path, publicUrl: getAvatarPublicUrl(data!.path) };
}

async function deleteAvatar(path: string): Promise<void> {
    const { error } = await supabaseAdmin.storage
        .from(AVATARS_BUCKET)
        .remove([path]);
    assertSuccess(error, "deleteAvatar");
}

// ── User avatars ─────────────────────────────────────────────────────────────

/**
 * Upload (or replace) a user's profile avatar.
 * Path: avatars/users/{userId}/{fileName}
 */
export async function uploadUserAvatar(
    userId: string,
    file: File,
): Promise<{ path: string; publicUrl: string }> {
    return uploadAvatar(paths.userAvatar(userId, file.name), file);
}

/**
 * Delete a user's profile avatar.
 */
export async function deleteUserAvatar(
    userId: string,
    fileName: string,
): Promise<void> {
    return deleteAvatar(paths.userAvatar(userId, fileName));
}

/**
 * Get the public CDN URL for a user avatar.
 */
export async function getUserAvatarPublicUrl(
    userId: string,
    fileName: string,
): Promise<string> {
    return getAvatarPublicUrl(paths.userAvatar(userId, fileName));
}

// ── Organization avatars ──────────────────────────────────────────────────────

/**
 * Upload (or replace) an organization's avatar.
 * Path: avatars/orgs/{orgId}/{fileName}
 */
export async function uploadOrgAvatar(
    orgId: string,
    file: File,
): Promise<{ path: string; publicUrl: string }> {
    return uploadAvatar(paths.orgAvatar(orgId, file.name), file);
}

/**
 * Delete an organization's avatar.
 */
export async function deleteOrgAvatar(
    orgId: string,
    fileName: string,
): Promise<void> {
    return deleteAvatar(paths.orgAvatar(orgId, fileName));
}

/**
 * Get the public CDN URL for an org avatar.
 */
export async function getOrgAvatarPublicUrl(
    orgId: string,
    fileName: string,
): Promise<string> {
    return getAvatarPublicUrl(paths.orgAvatar(orgId, fileName));
}

// ── Bot avatars ────────────────────────────────────────────────────────────────

/**
 * Upload (or replace) a bot's avatar.
 * Path: avatars/bots/{userId}/{botId}/{fileName}
 */
export async function uploadBotAvatar(
    userId: string,
    botId: string,
    file: File,
): Promise<{ path: string; publicUrl: string }> {
    return uploadAvatar(paths.botAvatar(userId, botId, file.name), file);
}

/**
 * Delete a bot's avatar.
 */
export async function deleteBotAvatar(
    userId: string,
    botId: string,
    fileName: string,
): Promise<void> {
    return deleteAvatar(paths.botAvatar(userId, botId, fileName));
}

/**
 * Get the public CDN URL for a bot avatar.
 */
export async function getBotAvatarPublicUrl(
    userId: string,
    botId: string,
    fileName: string,
): Promise<string> {
    return getAvatarPublicUrl(paths.botAvatar(userId, botId, fileName));
}
