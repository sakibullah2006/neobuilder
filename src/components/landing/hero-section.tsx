"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import BackgroundPaths from "@/components/kokonutui/background-paths";
import ShimmerText from "@/components/kokonutui/shimmer-text";
import TypewriterTitle from "@/components/kokonutui/type-writer";
import { motion } from "motion/react";

export function HeroSection() {
    return (
        <BackgroundPaths title="NeoBuilder">
            <div className="flex flex-col items-center justify-center gap-2">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex"
                >
                    <ShimmerText
                        text="NeoBuilder v1.0"
                        className="select-none text-sm font-medium tracking-widest uppercase bg-clip-text text-transparent bg-linear-to-r from-primary via-primary/50 to-primary"
                    />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="select-none text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-linear-to-b from-neutral-900 via-neutral-700 to-neutral-900 dark:from-white dark:via-neutral-200 dark:to-neutral-500 pb-2 text-center"
                >
                    The Lead-First <br className="hidden md:block" /> Chatbot Builder
                </motion.h1>

                <div className="w-full select-none max-w-3xl relative z-20">
                    <TypewriterTitle
                        sequences={[
                            { text: "Automate Customer Support 24/7", deleteAfter: true },
                            { text: "Capture Qualified Leads instantly", deleteAfter: true },
                            { text: "Intervene with Live Takeover", deleteAfter: true },
                            { text: "Grow Your Local Business", deleteAfter: false }
                        ]}
                        typingSpeed={60}
                        deleteSpeed={40}
                        pauseBeforeDelete={2000}
                        loopDelay={100}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 relative z-30"
                >
                    <Button size="lg" className="rounded-full text-base h-12 px-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" asChild>
                        <Link href="/signup">Get Started Free</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="rounded-full text-base h-12 px-8 hover:bg-muted transition-all duration-300 hover:scale-105" asChild>
                        <Link href="/demo">View Live Demo</Link>
                    </Button>
                </motion.div>
            </div>
        </BackgroundPaths>
    );
}
