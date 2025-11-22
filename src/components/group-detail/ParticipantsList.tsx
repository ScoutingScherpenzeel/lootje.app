"use client";

import {useEffect, useRef, useState, useTransition} from "react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import type {GroupDetailParticipant} from "@/actions/groupDetailActions";
import {CheckIcon, Copy, Download, ExternalLink, Eye, EyeOff, Loader2, Trash2, UserPlus2} from "lucide-react";
import {cn} from "@/lib/utils";
import {AnimatePresence, motion} from "motion/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import Link from "next/link";

interface ParticipantListProps {
    participants: GroupDetailParticipant[];
    isDrawn: boolean;
    onAddParticipant: (name: string) => Promise<void>;
    onRemoveParticipant: (participantId: string) => Promise<void>;
    className?: string;
}

export default function ParticipantsList({
                                             participants,
                                             isDrawn,
                                             onAddParticipant,
                                             onRemoveParticipant,
                                             className,
                                         }: ParticipantListProps) {
    const [name, setName] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [listError, setListError] = useState<string | null>(null);
    const [isAdding, startAddTransition] = useTransition();
    const [isRemoving, startRemoveTransition] = useTransition();
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [copiedParticipantId, setCopiedParticipantId] = useState<string | null>(null);
    const [shareOrigin, setShareOrigin] = useState<string | null>(null);
    const [showAssignments, setShowAssignments] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [pendingVisibility, setPendingVisibility] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const previousCountRef = useRef<number>(participants.length);

    const canEdit = !isDrawn;
    const hasAssignments = participants.some((participant) => Boolean(participant.assignedParticipantName));

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedName = name.trim();

        if (!trimmedName) {
            setFormError("Vul een naam in.");
            return;
        }

        setFormError(null);
        setListError(null);

        startAddTransition(async () => {
            try {
                await onAddParticipant(trimmedName);
                setName("");
                requestAnimationFrame(() => {
                    inputRef.current?.focus();
                });
            } catch (error) {
                setFormError(error instanceof Error ? error.message : "Kon deelnemer niet toevoegen.");
            }
        });
    };

    useEffect(() => {
        const previous = previousCountRef.current;
        if (canEdit && participants.length > previous) {
            requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
        }
        previousCountRef.current = participants.length;
    }, [participants.length, canEdit]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setShareOrigin(window.location.origin);
        }
    }, []);

    useEffect(() => {
        if (!copiedParticipantId) {
            return;
        }

        const timeout = window.setTimeout(() => {
            setCopiedParticipantId(null);
        }, 2000);

        return () => window.clearTimeout(timeout);
    }, [copiedParticipantId]);

    const handleRemove = (participantId: string) => {
        if (!canEdit) {
            return;
        }

        setListError(null);
        setRemovingId(participantId);

        startRemoveTransition(async () => {
            try {
                await onRemoveParticipant(participantId);
            } catch (error) {
                setListError(error instanceof Error ? error.message : "Kon deelnemer niet verwijderen.");
            } finally {
                setRemovingId(null);
            }
        });
    };

    const buildShareUrl = (token: string) => {
        const relativePath = `/bekijk/${encodeURIComponent(token)}`;
        return shareOrigin ? `${shareOrigin}${relativePath}` : relativePath;
    };

    const handleCopyShareLink = async (participant: GroupDetailParticipant) => {
        const shareUrl = buildShareUrl(participant.viewToken);

        if (!navigator.clipboard) {
            setListError("Kopiëren wordt niet ondersteund door deze browser.");
            return;
        }

        setListError(null);

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopiedParticipantId(participant.id);
        } catch (error) {
            setListError(error instanceof Error ? error.message : "Kon link niet kopiëren.");
        }
    };

    const handleExportToExcel = async () => {
        if (isExporting) {
            return;
        }

        setListError(null);
        setIsExporting(true);

        // Delay to allow button state to update (better feeling app)
        await new Promise(r => setTimeout(r, 500));

        try {
            const XLSX = await import("xlsx");
            const rows = participants.map((participant, index) => ({
                Nummer: index + 1,
                Deelnemer: participant.name,
                "Heeft getrokken": participant.assignedParticipantName ?? "",
                "Persoonlijke link": buildShareUrl(participant.viewToken),
            }));

            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Lootjes");

            const timestamp = new Date().toISOString().slice(0, 10);
            XLSX.writeFile(workbook, `lootjes-${timestamp}.xlsx`, {bookType: "xlsx"});
        } catch (error) {
            setListError(error instanceof Error ? error.message : "Kon lootjes niet exporteren.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div
            className={cn(
                "relative overflow-hidden border-8 border-black bg-white px-7 py-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]",
                className,
            )}
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                    <div className="space-y-1">
                        <Badge variant={"yellow"} size={"large"}>
                            Deelnemers
                        </Badge>
                        <h2 className="text-4xl font-black uppercase leading-none tracking-tight">
                            {isDrawn ? "Getrokken lootjes" : "Bouw je lijst"}
                        </h2>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <p className="text-xs font-semibold uppercase text-black/60">
                                {participants.length} {participants.length === 1 ? "persoon" : "personen"} aangemeld
                            </p>
                            {hasAssignments ? (
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 mt-4">
                                    <Button size={"sm"} variant={"outline"} onClick={() => {
                                        const nextVisibility = !showAssignments;
                                        setPendingVisibility(nextVisibility);
                                        setConfirmDialogOpen(true);
                                    }}>
                                        {showAssignments ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                        {showAssignments ? "Verberg lootjes" : "Toon lootjes"}
                                    </Button>
                                    {!canEdit && (
                                        <Button size={"sm"} variant={"success"} onClick={handleExportToExcel}
                                                disabled={isExporting}>
                                            {isExporting ? <Loader2 className="animate-spin"/> :
                                                <Download/>}
                                            Exporteer lootjes
                                        </Button>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {!canEdit ? null : (
                        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 lg:flex-row lg:items-end">
                            <div className="flex flex-1 flex-col gap-2">
                                <Label htmlFor="participant-name" className="text-xs font-black uppercase">
                                    Naam toevoegen
                                </Label>
                                <Input
                                    id="participant-name"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    disabled={isAdding}
                                    placeholder="Bijv. Sara"
                                    ref={inputRef}
                                    className="h-12 w-full border-4 border-black bg-white text-base font-semibold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0"
                                />
                            </div>
                            <Button disabled={isAdding} type={"submit"}>
                                {isAdding ? <Loader2 className={"animate-spin"}/> : <UserPlus2/>}
                                Toevoegen
                            </Button>
                            {formError ? <p className="text-sm font-semibold text-red-600">{formError}</p> : null}
                        </form>)}
                </div>

                <div className="space-y-3">
                    <AnimatePresence mode="wait" initial={false}>
                        {participants.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{opacity: 0, y: 12}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -12}}
                                transition={{duration: 0.2}}
                                className="border-4 border-dashed border-black px-6 py-10 text-center text-lg font-black uppercase text-black/60"
                            >
                                Nog niemand toegevoegd — start bovenin!
                            </motion.div>
                        ) : (
                            <motion.ul
                                key="list"
                                initial={{opacity: 0, y: 16}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -16}}
                                transition={{duration: 0.2}}
                                className="space-y-3"
                            >
                                <AnimatePresence initial={false}>
                                    {participants.map((participant, index) => (
                                        <motion.li
                                            key={participant.id}
                                            layout
                                            initial={{opacity: 0, y: 16, scale: 0.98}}
                                            animate={{opacity: 1, y: 0, scale: 1}}
                                            exit={{opacity: 0, y: -16, scale: 0.95}}
                                            transition={{duration: 0.25}}
                                            className={cn(
                                                "relative border-4 border-black px-4 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-colors duration-200",
                                                canEdit
                                                    ? "bg-yellow-200"
                                                    : (participant.viewedAt ? "bg-green-300" : "bg-blue-300")
                                            )}
                                        >
                                            {canEdit ? (
                                                <Button variant={"destructive"} title="Verwijder deelnemer"
                                                        size={"sm"}
                                                        onClick={() => handleRemove(participant.id)}
                                                        className={"absolute right-4 top-3"}
                                                        disabled={!canEdit || (isRemoving && removingId === participant.id)}>
                                                    {isRemoving && removingId === participant.id ?
                                                        <Loader2 className="animate-spin"/> : <Trash2/>}
                                                </Button>
                                            ) : null}

                                            <div
                                                className={cn(
                                                    "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
                                                    canEdit ? "pr-12" : "pr-0",
                                                )}
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className="relative">
                                                        <span
                                                            className="inline-flex h-16 w-16 -rotate-6 items-center justify-center border-4 border-black bg-white text-2xl font-black">
                                                          #{index + 1}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <div className={"flex flex-col flex-wrap"}>
                                                            <p className="text-2xl font-black uppercase tracking-tight">{participant.name}</p>

                                                            {participant.viewedAt != null && (<Badge
                                                                variant={"success"}
                                                                size={"small"}
                                                            >
                                                                <CheckIcon/> Bekeken
                                                            </Badge>)}
                                                        </div>
                                                        <AnimatePresence mode="wait" initial={false}>
                                                            {showAssignments ? (
                                                                <motion.p
                                                                    key="assignment"
                                                                    initial={{opacity: 0, y: -6}}
                                                                    animate={{opacity: 1, y: 0}}
                                                                    exit={{opacity: 0, y: 6}}
                                                                    transition={{duration: 0.2}}
                                                                    className={cn(
                                                                        "text-xs font-semibold uppercase",
                                                                        canEdit ? "text-black/60" : "text-black/70",
                                                                    )}
                                                                >
                                                                    ↦ Heeft
                                                                    getrokken: {participant.assignedParticipantName}
                                                                </motion.p>
                                                            ) : null}
                                                        </AnimatePresence>

                                                    </div>
                                                </div>

                                                {!canEdit ? (
                                                    <motion.div
                                                        initial={{opacity: 0, y: 8}}
                                                        animate={{opacity: 1, y: 0}}
                                                        exit={{opacity: 0, y: -8}}
                                                        transition={{duration: 0.2}}
                                                        className="flex flex-col items-start gap-2 border-t-4 border-dashed border-black/40 pt-4 md:border-t-0 md:pt-0 md:text-right"
                                                    >
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/60">
                                                            Persoonlijke link
                                                        </p>
                                                        <div className="flex flex-col gap-2 sm:flex-row">
                                                            <Button size={"sm"} variant={"outline"}
                                                                    onClick={() => handleCopyShareLink(participant)}>
                                                                {copiedParticipantId === participant.id ? <CheckIcon/> :
                                                                    <Copy/>}
                                                                Kopieer
                                                            </Button>
                                                            <Button asChild size={"sm"}>
                                                                <Link
                                                                    href={`/bekijk/${encodeURIComponent(participant.viewToken)}`}
                                                                    target={"_blank"} rel={"noopener noreferrer"}>
                                                                    <ExternalLink className="h-4 w-4"/>
                                                                    Open link
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                ) : null}
                                            </div>
                                        </motion.li>
                                    ))}
                                </AnimatePresence>
                            </motion.ul>
                        )}
                    </AnimatePresence>
                </div>

                {listError ? <p className="text-sm font-semibold text-red-600">{listError}</p> : null}
            </div>

            <Dialog
                open={confirmDialogOpen}
                onOpenChange={(open) => {
                    setConfirmDialogOpen(open);
                }}
            >
                <DialogContent className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                               showCloseButton={false}>
                    <DialogHeader className="space-y-3">
                        <DialogTitle className="text-2xl font-black uppercase">
                            {pendingVisibility ? "Lootjes tonen?" : "Lootjes verbergen?"}
                        </DialogTitle>
                        <DialogDescription className="text-sm font-semibold uppercase text-black/60">
                            {pendingVisibility
                                ? "Je staat op het punt om alle lootjes voor jezelf zichtbaar te maken, weet je het zeker?"
                                : "Je kunt altijd later weer kiezen om de lootjes te tonen."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button size={"sm"} variant={"outline"} onClick={() => {
                            setConfirmDialogOpen(false);
                        }}>
                            Annuleer
                        </Button>
                        <Button variant={"success"} size={"sm"} onClick={() => {
                            setShowAssignments(pendingVisibility);
                            setConfirmDialogOpen(false);
                        }}>
                            Bevestig
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
