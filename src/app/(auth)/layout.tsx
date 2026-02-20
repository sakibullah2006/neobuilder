import { ReactNode } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
    children: ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (session) redirect('/dashboard');

    return (
        <section className="bg-dot-pattern pt-8 min-h-screen">
            <button className="absolute top-5 left-5">
                <Link href="/" className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'>
                    <ArrowLeft /> Back
                </Link>
            </button>
            {children}
        </section>
    );
}