"use client";

import {useState} from "react";
import Snowfall from "react-snowfall";
import {AnimatePresence, motion} from "motion/react";
import {AlertCircle, Lock, Sparkles, Unlock} from "lucide-react";
import {Button} from "@/components/ui/button";
import {markParticipantAsViewed} from "@/actions/groupDetailActions";

export type ParticipantRevealViewProps =
    | { status: "invalid" }
    | { status: "not-drawn"; participantName: string; groupName: string | null }
    | {
    status: "ready";
    participantName: string;
    assignedParticipantName: string;
    groupName: string | null;
    token: string;
};

export default function DeelnemerView(props: ParticipantRevealViewProps) {
    if (props.status === "invalid") {
        return (
            <RevealShell>
                <StateCard
                    icon={<AlertCircle className="h-16 w-16 text-red-100"/>}
                    title="Ongeldige link"
                    message="Vraag de organisator om je een nieuwe persoonlijke link te sturen."
                />
            </RevealShell>
        );
    }

    if (props.status === "not-drawn") {
        const {participantName, groupName} = props;
        return (
            <RevealShell>
                <StateCard
                    icon={<Lock className="h-16 w-16 text-red-100"/>}
                    title="Nog even geduld!"
                    message={
                        groupName
                            ? `${groupName} is nog niet geloot. Laat ${participantName} binnenkort nog eens kijken.`
                            : "De organisator heeft de loting nog niet uitgevoerd. Probeer het later opnieuw."
                    }
                />
            </RevealShell>
        );
    }

    return <RevealExperience {...props} />;
}

type RevealExperienceProps = Extract<ParticipantRevealViewProps, { status: "ready" }>;

function RevealExperience({participantName, assignedParticipantName, groupName, token}: RevealExperienceProps) {
    const [revealed, setRevealed] = useState(false);

    async function reveal() {
        setRevealed(true);
        await markParticipantAsViewed(token);
    }

    return (
        <RevealShell>
            <motion.div
                layout
                initial={{opacity: 0, y: 32}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.45, ease: "easeOut"}}
                className="relative z-10 w-full max-w-4xl p-3"
            >
                <motion.div
                    layout
                    initial={{rotate: -3, scale: 0.96}}
                    animate={{rotate: 0, scale: 1}}
                    transition={{
                        type: "spring",
                        stiffness: 80,
                        damping: 14,
                        layout: {duration: 0.45, ease: "easeInOut"},
                    }}
                    className="mx-auto w-full max-w-2xl rounded-xl border-8 border-black bg-white px-6 py-8 text-center -translate-2 shadow-[18px_18px_0px_rgba(0,0,0)] sm:px-10 sm:py-12"
                >
                    <motion.div
                        initial={{scale: 0.6, opacity: 0}}
                        animate={{scale: 1, opacity: 1}}
                        transition={{type: "spring", bounce: 0.5, delay: 0.1}}
                        className="mx-auto flex items-center justify-center gap-4 text-5xl sm:text-6xl"
                    >
                        <span aria-hidden="true">🎁</span>
                        <Sparkles className="h-10 w-10 text-red-500 sm:h-12 sm:w-12" aria-hidden="true"/>
                        <span aria-hidden="true">🎄</span>
                    </motion.div>

                    <div className="mt-6 space-y-3">
                        {groupName ? (
                            <motion.p
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="inline-block rounded-md border-4 border-black bg-green-600 px-6 py-3 text-lg font-black uppercase tracking-wide text-white"
                            >
                                🎄 {groupName}
                            </motion.p>
                        ) : null}
                        <motion.h1
                            initial={{opacity: 0, y: 14}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.25}}
                            className="text-4xl font-black uppercase tracking-tight text-black sm:text-5xl"
                        >
                            Hoi, {participantName}!
                        </motion.h1>
                    </div>

                    <motion.div
                        layout
                        transition={{layout: {duration: 0.35, ease: "easeInOut"}}}
                        className="mt-10"
                    >
                        <AnimatePresence mode="wait">
                            {!revealed ? (
                                <motion.div
                                    key="locked"
                                    layout
                                    initial={{opacity: 0, y: 16}}
                                    animate={{opacity: 1, y: 0}}
                                    exit={{opacity: 0, y: -16}}
                                    transition={{duration: 0.3, layout: {duration: 0.35, ease: "easeInOut"}}}
                                    className="space-y-8"
                                >
                                    <div
                                        className="mx-auto flex h-30 w-30 md:h-50 md:w-50 p-5 md:p-10 items-center justify-center rounded-full border-8 border-yellow-400 bg-black">
                                        <Lock className="text-yellow-300 w-full h-full"/>
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-3xl font-black uppercase leading-tight sm:text-4xl text-black text-balance">
                                            Jouw lootje is nog verborgen
                                        </h2>
                                        <p className="mx-auto max-w-md text-sm font-semibold uppercase tracking-widest text-neutral-700 text-balance">
                                            Druk op de knop hieronder om te ontdekken wie jij hebt getrokken!
                                        </p>
                                    </div>
                                    <Button
                                        onClick={reveal}
                                        className="group inline-flex items-center gap-3 border-8 border-black bg-red-600 px-12 py-6 text-xl font-black uppercase tracking-wide text-white shadow-[12px_12px_0px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-1 hover:shadow-[16px_16px_0px_rgba(0,0,0,0.35)]"
                                        size="lg"
                                    >
                                        <Unlock className="h-6 w-6 transition-transform group-hover:rotate-12"/>
                                        Onthullen maar!
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="revealed"
                                    layout
                                    initial={{opacity: 0, scale: 0.85}}
                                    animate={{opacity: 1, scale: 1}}
                                    transition={{
                                        type: "spring",
                                        stiffness: 150,
                                        damping: 12,
                                        layout: {duration: 0.35, ease: "easeInOut"},
                                    }}
                                    className="space-y-10"
                                >
                                    <motion.div
                                        layout
                                        initial={{rotate: -18, opacity: 0}}
                                        animate={{rotate: 0, opacity: 1}}
                                        transition={{
                                            type: "spring",
                                            stiffness: 120,
                                            damping: 12,
                                            layout: {duration: 0.35, ease: "easeInOut"},
                                        }}
                                        className="relative mx-auto max-w-md border-8 border-black bg-green-600 px-6 py-10 text-white shadow-[10px_10px_0px_rgba(0,0,0,0.5)]"
                                    >
										<span className="absolute right-4 top-3 text-4xl opacity-40" aria-hidden="true">
											🎄
										</span>
                                        <span className="absolute bottom-2 left-4 text-3xl opacity-40"
                                              aria-hidden="true">
											⭐
										</span>
                                        <p className="text-sm font-black uppercase tracking-[0.4em] text-yellow-200">Jij
                                            hebt getrokken:</p>
                                        <h2 className="mt-4 text-4xl font-black uppercase leading-tight sm:text-5xl">
                                            {assignedParticipantName}
                                        </h2>
                                    </motion.div>

                                    <motion.p
                                        initial={{opacity: 0, y: 18}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{delay: 0.1}}
                                        className="mx-auto max-w-lg rounded-lg border-4 border-black bg-white/90 p-2 text-sm font-black uppercase tracking-[0.3em] text-red-600"
                                    >
                                        Ssst... bewaar dit geheim goed!
                                    </motion.p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            </motion.div>
        </RevealShell>
    );
}

type StateCardProps = {
    icon: React.ReactNode;
    title: string;
    message: string;
};

function StateCard({icon, title, message}: StateCardProps) {
    return (
        <motion.div
            initial={{opacity: 0, y: 24}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.4, ease: "easeOut"}}
            className="relative z-10 w-full max-w-xl rounded-2xl border-8 border-black bg-white px-6 py-12 text-center shadow-[18px_18px_0px_rgba(0,0,0,0.4)] sm:px-10"
        >
            <div
                className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-8 border-red-200 bg-red-600">
                {icon}
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-black sm:text-4xl">{title}</h1>
            <p className="mt-4 text-base font-semibold uppercase tracking-widest text-neutral-700">
                {message}
            </p>
        </motion.div>
    );
}

type RevealShellProps = {
    children: React.ReactNode;
};

function RevealShell({children}: RevealShellProps) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-yellow-400 text-white">
            <Snowfall
                color="white"
                snowflakeCount={120}
                style={{position: "absolute", width: "100%", height: "100%"}}
            />
            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-8 -rotate-1">
                {children}
            </div>
        </div>
    );
}