import { ReactNode } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

interface AuthLayoutProps {
    children: ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (session) redirect('/dashboard');

    return (
        <section>
            {children}
        </section>
    );
}