"use client";

import {useState, useTransition} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {AnimatePresence, motion} from "motion/react";
import {
    ArrowLeft,
    AlertCircle,
    CalendarDays,
    CheckCircle,
    Loader2,
    Shuffle,
    Sparkles,
    Users,
} from "lucide-react";

import ParticipantsList from "./ParticipantsList";
import {
    addParticipant,
    drawGroup,
    removeParticipant,
    type GroupDetailPayload,
} from "@/actions/groupDetailActions";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";

type GroupDetailViewProps = GroupDetailPayload;

export default function GroupDetailView({group, participants}: GroupDetailViewProps) {
    const router = useRouter();
    const [drawError, setDrawError] = useState<string | null>(null);
    const [isDrawing, startDrawTransition] = useTransition();

    const participantCount = participants.length;
    const participantsNeeded = Math.max(0, 3 - participantCount);
    const canDraw = !group.isDrawn && participantCount >= 3;

    const handleAddParticipant = async (name: string) => {
        await addParticipant({groupId: group.id, name});
        router.refresh();
    };

    const handleRemoveParticipant = async (participantId: string) => {
        await removeParticipant({groupId: group.id, participantId});
        router.refresh();
    };

    const handleDrawGroup = () => {
        if (!canDraw) {
            return;
        }

        setDrawError(null);
        startDrawTransition(async () => {
            try {
                await drawGroup({groupId: group.id});
                router.refresh();
            } catch (error) {
                setDrawError(error instanceof Error ? error.message : "Er ging iets mis.");
            }
        });
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-yellow-400 pb-24">
            <div className="pointer-events-none" aria-hidden="true">
                <div
                    className="absolute -left-24 top-32 h-72 w-72 -rotate-12 border-8 border-black bg-red-500 opacity-30"/>
                <div
                    className="absolute -right-20 top-120 h-64 w-64 rotate-6 border-8 border-black bg-green-400 opacity-30"/>
                <div
                    className="absolute -bottom-32 left-10 h-80 w-80 rotate-3 border-8 border-black bg-yellow-300 opacity-30"/>
            </div>

            <div className="relative z-10 mx-auto max-w-6xl px-6 py-16">
                <motion.section
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.3}}
                    className="relative overflow-hidden border-8 border-red-500 bg-white px-8 py-10 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] -rotate-1 -translate-x-1 rounded-md"
                >

                    <div className="relative z-10 grid gap-8 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
                        <Button asChild variant={"outline"}>
                            <Link href="/">
                                <ArrowLeft/> Ga terug
                            </Link>
                        </Button>
                        <div className="flex flex-wrap items-center gap-3 justify-self-end">
                            <Badge>
                                <Users/> {participantCount} {participantCount === 1 ? "deelnemer" : "deelnemers"}
                            </Badge>
                            <Badge variant={group.isDrawn ? "success" : "outline"}>
                                <Sparkles/> {group.isDrawn ? "Geloot" : "Nog niet geloot"}
                            </Badge>
                            {group.isDrawn ? (
                                <Badge variant="outline">
                                    <CalendarDays/> Datum trekking: {group.drawnAt?.toLocaleDateString("nl-NL")}
                                </Badge>
                            ) : null}
                        </div>

                        <div className="lg:col-span-2">
                            <Badge variant={"yellow"} size={"large"}>
                                Trekking
                            </Badge>
                            <h2 className="mt-4">
                                {group.name}
                            </h2>
                        </div>
                    </div>
                </motion.section>

                <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,2.2fr)_minmax(320px,1fr)]">
                    <motion.section
                        initial={{opacity: 0, y: 24}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.1, duration: 0.3}}
                        className="space-y-8"
                    >
                        <ParticipantsList
                            className="shadow-[14px_14px_0px_0px_rgba(0,0,0,1)] rounded-md"
                            participants={participants}
                            isDrawn={group.isDrawn}
                            onAddParticipant={handleAddParticipant}
                            onRemoveParticipant={handleRemoveParticipant}
                        />
                    </motion.section>

                    <motion.aside
                        initial={{opacity: 0, y: 40}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.15, duration: 0.3}}
                        className="space-y-6 lg:sticky lg:top-24"
                    >
                        <StatusBanner
                            isDrawn={group.isDrawn}
                            participantCount={participantCount}
                            participantsNeeded={participantsNeeded}
                        />

                        <div
                            className="relative overflow-hidden border-8 border-black bg-white px-6 py-7 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-md">
                            <div className="relative z-10 space-y-4">
                                <h3 className="text-xl font-black uppercase tracking-tight">Overzicht</h3>
                                <div className="grid gap-3">
                                    <StatRow label="Deelnemers" value={`${participantCount}`}
                                             icon={<Users className="h-5 w-5"/>}/>
                                    <StatRow
                                        label="Status"
                                        value={group.isDrawn ? "Loting voltooid" : "Nog te loten"}
                                        icon={<Sparkles className="h-5 w-5"/>}
                                    />
                                    <StatRow
                                        label="Laatste update"
                                        value={group.updatedAt.toLocaleDateString("nl-NL")}
                                        icon={<CalendarDays className="h-5 w-5"/>}
                                    />
                                </div>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {!group.isDrawn ? (
                                <motion.div
                                    key="draw-card"
                                    initial={{opacity: 0, y: 24, scale: 0.98}}
                                    animate={{opacity: 1, y: 0, scale: 1}}
                                    exit={{opacity: 0, y: -24, scale: 0.96}}
                                    transition={{duration: 0.25, ease: "easeOut"}}
                                    className="relative overflow-hidden border-8 border-black bg-red-500 px-6 py-8 text-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-md"
                                >
                                    <div className="absolute right-4 top-4 text-5xl opacity-20">🎲</div>
                                    <div className="relative z-10 space-y-5">
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-2xl font-black uppercase tracking-tight">Start de
                                                loting</h3>
                                            <p className="text-xs font-semibold uppercase text-white/70">
                                                Wij zorgen dat niemand zichzelf loot.
                                            </p>
                                        </div>
                                        <Button onClick={handleDrawGroup} size={"lg"} variant={"outline"}
                                                disabled={!canDraw || isDrawing} className={"w-full"}>
                                            {isDrawing ? (
                                                <><Loader2 className="animate-spin"/>Bezig...</>
                                            ) : (
                                                <><Shuffle/>Trek lootjes nu</>
                                            )}
                                        </Button>
                                        {drawError ?
                                            <p className="text-xs font-semibold uppercase text-yellow-200">{drawError}</p> : null}
                                    </div>
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </motion.aside>
                </div>
            </div>
        </div>
    );
}

type StatusBannerProps = {
    isDrawn: boolean;
    participantCount: number;
    participantsNeeded: number;
};

function StatusBanner({isDrawn, participantCount, participantsNeeded}: StatusBannerProps) {
    if (isDrawn) {
        return (
            <div
                className="flex items-center gap-4 border-8 border-black bg-green-300 px-5 py-4 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-md">
                <div className="flex p-2 items-center justify-center border-4 border-black bg-white">
                    <CheckCircle className="h-6 w-6 text-green-700"/>
                </div>
                <p className="text-sm font-black uppercase leading-snug text-black">
                    Loting voltooid! Deel de persoonlijke links met alle deelnemers.
                </p>
            </div>
        );
    }

    if (participantCount >= 3) {
        return (
            <div
                className="flex items-center gap-4 border-8 border-black bg-orange-400 px-5 py-4 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-md">
                <div className="flex p-2 items-center justify-center border-4 border-black bg-white">
                    <CheckCircle className="h-6 w-6 text-black"/>
                </div>
                <p className="text-sm font-black uppercase leading-snug text-black">
                    Klaar! {participantCount} mensen — druk op de knop om te loten.
                </p>
            </div>
        );
    }

    return (
        <div
            className="flex items-center gap-4 border-8 border-black bg-red-600 px-5 py-4 text-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-md">
            <div className="flex p-2 items-center justify-center border-4 border-black bg-white text-red-600">
                <AlertCircle className="h-6 w-6"/>
            </div>
            <p className="text-sm font-black uppercase leading-snug">
                Minimaal 3 deelnemers nodig — nog {participantsNeeded} te gaan.
            </p>
        </div>
    );
}


type StatRowProps = {
    label: string;
    value: string;
    icon: React.ReactNode;
};

function StatRow({label, value, icon}: StatRowProps) {
    return (
        <div
            className="flex items-center justify-between gap-4 border-4 border-black bg-yellow-200 px-4 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center border-4 border-black bg-white text-black">
                    {icon}
                </span>
                <div className="flex flex-col">
                    <span className="text-md font-black uppercase">{label}</span>
                    <span className="text-sm font-bold uppercase text-black">{value}</span>
                </div>
            </div>

        </div>
    );
}
