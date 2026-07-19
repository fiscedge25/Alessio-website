"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

const ParticleBackground = dynamic(
    () => import("@/components/ParticleBackground"),
    { ssr: false }
);

export default function Home() {
    return (
        <>
            <ParticleBackground />
            <div className="grain-overlay" />

            <Navbar />

            <main>
                <Hero />
            </main>

            <Footer />
        </>
    );
}
