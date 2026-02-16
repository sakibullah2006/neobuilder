import { Header } from "@/components/Header";
import { HeroSection } from "@/components/landing/hero-section";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-between bg-background">
        <HeroSection />
      </main>
    </>
  );
}
