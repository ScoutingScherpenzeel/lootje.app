"use client"

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteGroup } from "@/actions/groupsAction";
import { Users, ArrowRight, Trash2, Loader2 } from "lucide-react";
import type { groups } from "@/db/schema/schema";
import { motion } from 'framer-motion';
import DeleteGroupDialog from "@/components/DeleteGroupDialog";
import Link from "next/link";
import { cn } from "@/lib/utils";

const colors = ['bg-red-600', 'bg-green-700', 'bg-white', 'bg-red-600'];
const rotations = ['rotate-1', '-rotate-2', 'rotate-2', '-rotate-1'];
const emojis = ['🎄', '⛄', '🎅', '⭐'];

type GroupRow = typeof groups.$inferSelect;

export type GroupWithCount = GroupRow & { participantCount?: number };

type GroupCardProps = {
    group: GroupWithCount;
    participantCount?: number;
    index?: number;
};

export default function GroupCard({ group, participantCount = 0, index = 0 }: GroupCardProps) {
    const router = useRouter();
    const bgColor = colors[index % colors.length];
    const rotation = rotations[index % rotations.length];
    const emoji = emojis[index % emojis.length];
    const isDark = bgColor === 'bg-black' || bgColor === 'bg-red-600' || bgColor === 'bg-green-700';
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, startDeleteTransition] = useTransition();

    const handleDelete = () => {
        setDeleteError(null);

        startDeleteTransition(() => {
            deleteGroup({ groupId: group.id })
                .then(() => {
                    setShowDeleteDialog(false);
                    router.refresh();
                })
                .catch((error) => {
                    console.error("Failed to delete group", error);
                    setDeleteError(
                        error instanceof Error
                            ? error.message
                            : "Er ging iets mis bij het verwijderen."
                    );
                });
        });
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            whileHover={{ scale: 1.02, rotate: 0 }}
            transition={{ duration: 0.2 }}
            className={cn("w-full", "transform", rotation)}
        >
            <Card
                className={cn(
                    "relative w-full overflow-hidden border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all",
                    bgColor
                )}
            >
                <div className="absolute top-4 right-4 text-6xl opacity-30">{emoji}</div>
                <div className="absolute bottom-2 left-2 text-3xl opacity-20">❄️</div>

                <CardHeader className="relative pb-2">
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className={`text-3xl font-black uppercase tracking-tight leading-tight ${isDark ? 'text-white' : 'text-black'}`}>
                            {group.name}
                        </CardTitle>
                        <div className={`px-3 py-1 border-2 border-black text-xs font-black uppercase whitespace-nowrap ${group.isDrawn
                                ? 'bg-green-400 text-black'
                                : 'bg-white text-black'
                            }`}>
                            {group.isDrawn ? '✓ KLAAR' : 'NIEUW'}
                        </div>
                    </div>
        
                </CardHeader>

                <CardContent className="relative space-y-4 pt-4">
                    <div className="space-y-2">
                        <div className={`flex items-center gap-3 px-3 py-2 border-2 border-black ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                            <Users className="w-5 h-5" />
                            <span className={`font-black uppercase text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                                {participantCount} Deelnemers
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={`/trekking/${group.id}`}
                            className={`flex h-14 flex-1 items-center justify-center gap-3 px-6 ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-900'} font-black uppercase border-4 border-black text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/30`}
                        >
                            <span>Bekijk</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Button
                            type="button"
                            onClick={() => {
                                setDeleteError(null);
                                setShowDeleteDialog(true);
                            }}
                            disabled={isDeleting}
                            aria-label="Verwijder trekking"
                            className={`h-14 w-14 min-w-14 border-4 border-black bg-red-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${isDeleting ? 'opacity-80' : 'hover:bg-red-700'}`}
                        >
                            {isDeleting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Trash2 className="w-5 h-5" />
                            )}
                            <span className="sr-only">Verwijder</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <DeleteGroupDialog
                groupName={group.name}
                open={showDeleteDialog}
                onOpenChange={(nextOpen: boolean) => {
                    setShowDeleteDialog(nextOpen);
                    if (!nextOpen) {
                        setDeleteError(null);
                    }
                }}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                error={deleteError}
            />
        </motion.div>
    );
}