"use server"

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";

export async function withAuth<T>(cb: (tx: any) => Promise<T>): Promise<T> {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;
    const orgId = session?.session?.activeOrganizationId; // From Org Plugin

    // Note: Better-auth 'role' in an org context is usually 
    // found in the 'member' record, but you can also pass 
    // a global 'admin' role if the user is a super-admin.
    const userRole = session?.user?.role || 'member';

    return await db.transaction(async (tx) => {
        if (userId) {
            await tx.execute(sql`SELECT set_config('app.current_user_id', ${userId}, true)`);
            await tx.execute(sql`SELECT set_config('app.current_user_role', ${userRole}, true)`);
        }
        if (orgId) {
            await tx.execute(sql`SELECT set_config('app.current_org_id', ${orgId}, true)`);
        }
        return await cb(tx);
    });
}