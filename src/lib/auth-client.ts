import { adminClient, inferAdditionalFields, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, admin, member, owner } from "./auth-permissions";
import { auth } from "./auth";

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_BASE_URL,
    plugins: [
        inferAdditionalFields<typeof auth>(),
        organizationClient({
            ac,
            roles: {
                owner,
                admin,
                member,
            },
        }),
        adminClient(),
    ],
});

export const {
    signIn,
    signOut,
    signUp,
    useSession,
    useListOrganizations,
    useActiveOrganization,
} = authClient;

export type Session = typeof authClient.$Infer.Session;
export type Organization = typeof authClient.$Infer.Organization;
export type Member = typeof authClient.$Infer.Member;
