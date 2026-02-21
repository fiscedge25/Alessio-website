"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Education from "@/components/Education";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Services from "@/components/Services";

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
                <div className="section-divider" />
                <About />
                <div className="section-divider" />
                <Services />
                <div className="section-divider" />
                <Education />
                <div className="section-divider" />
                <Experience />
                <div className="section-divider" />
                <Projects />
                <div className="section-divider" />
                <Skills />
                <div className="section-divider" />
                <Contact />
            </main>

            <Footer />
        </>
    );
}
