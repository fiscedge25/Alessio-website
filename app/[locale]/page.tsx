import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import Navbar from "@/components/hub/Navbar";
import Hero from "@/components/hub/Hero";
import NowBuilding from "@/components/hub/NowBuilding";
import SelectedProjects from "@/components/hub/SelectedProjects";
import Lab from "@/components/hub/Lab";
import BuildLog from "@/components/hub/BuildLog";
import IdeaBox from "@/components/hub/IdeaBox";
import GitHubSection from "@/components/hub/GitHubSection";
import Ecosystem from "@/components/hub/Ecosystem";
import Interests, { StackRow } from "@/components/hub/Interests";
import Creed from "@/components/hub/Creed";
import About, { BuildTogether } from "@/components/hub/About";
import OpenTo from "@/components/hub/OpenTo";
import Footer from "@/components/hub/Footer";
import type { Locale } from "@/lib/hub";

export default function Home({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    return <Hub params={params} />;
}

async function Hub({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = (await params) as { locale: Locale };
    setRequestLocale(locale);
    return <Sections locale={locale} />;
}

function Sections({ locale }: { locale: Locale }) {
    const t = useTranslations("hub");
    const aboutParas: string[] = [
        t("about.p1"),
        t("about.p2"),
        t("about.p3"),
        t("about.p4"),
    ];
    const openTopics: string[] = [
        t("open.t1"),
        t("open.t2"),
        t("open.t3"),
        t("open.t4"),
        t("open.t5"),
        t("open.t6"),
    ];

    return (
        <>
            <Navbar />
            <main>
                <Hero />
                <NowBuilding
                    locale={locale}
                    index="01"
                    eyebrow={t("building.eyebrow")}
                    title={t("building.title")}
                    intro={t("building.intro")}
                    explore={t("common.explore")}
                    visit={t("common.visit")}
                    viewAll={t("building.viewAll")}
                />
                <SelectedProjects
                    locale={locale}
                    index="02"
                    eyebrow={t("projects.eyebrow")}
                    title={t("projects.title")}
                    intro={t("projects.intro")}
                    view={t("common.view")}
                />
                <Lab
                    locale={locale}
                    index="03"
                    eyebrow={t("lab.eyebrow")}
                    title={t("lab.title")}
                    intro={t("lab.intro")}
                    line2={t("lab.line2")}
                    view={t("common.view")}
                />
                <BuildLog
                    locale={locale}
                    index="04"
                    eyebrow={t("notes.eyebrow")}
                    title={t("notes.title")}
                    intro={t("notes.intro")}
                    viewAll={t("notes.viewAll")}
                    discuss={t("notes.discuss")}
                />
                <IdeaBox locale={locale} />
                <GitHubSection
                    index="06"
                    eyebrow={t("github.eyebrow")}
                    title={t("github.title")}
                    intro={t("github.intro")}
                    explore={t("github.explore")}
                    updated={t("github.updated")}
                />
                <Ecosystem
                    index="07"
                    eyebrow={t("ecosystem.eyebrow")}
                    title={t("ecosystem.title")}
                    intro={t("ecosystem.intro")}
                    exploreFiscedge={t("ecosystem.exploreFiscedge")}
                    exploreAcademy={t("ecosystem.exploreAcademy")}
                />
                <Interests
                    locale={locale}
                    index="08"
                    eyebrow={t("interests.eyebrow")}
                    title={t("interests.title")}
                />
                <StackRow title={t("stack.title")} />
                <Creed
                    eyebrow={t("creed.eyebrow")}
                    line1={t("creed.line1")}
                    line2={t("creed.line2")}
                    role={t("creed.role")}
                    alt={t("creed.alt")}
                />
                <About
                    locale={locale}
                    index="09"
                    eyebrow={t("about.eyebrow")}
                    title={t("about.title")}
                    paragraphs={aboutParas}
                    based={t("about.based")}
                />
                <BuildTogether
                    locale={locale}
                    title={t("together.title")}
                    intro={t("together.intro")}
                    detail={t("together.detail")}
                    approach={t("together.approach")}
                    cta={t("together.cta")}
                />
                <OpenTo
                    locale={locale}
                    index="10"
                    eyebrow={t("open.eyebrow")}
                    title={t("open.title")}
                    intro={t("open.intro")}
                    topics={openTopics}
                    cta={t("open.cta")}
                />
            </main>
            <Footer />
        </>
    );
}
