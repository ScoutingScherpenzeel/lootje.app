"use client"

import {useState, useTransition} from "react";
import {useRouter} from "next/navigation";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

import {deleteGroup} from "@/actions/groupsAction";
import {Users, ArrowRight, Trash2, Loader2, CheckIcon, Sparkles} from "lucide-react";
import type {groups} from "@/db/schema/schema";
import {motion} from 'framer-motion';
import DeleteGroupDialog from "@/components/DeleteGroupDialog";
import Link from "next/link";
import {cn} from "@/lib/utils";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";

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

export default function GroupCard({group, participantCount = 0, index = 0}: GroupCardProps) {
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
            deleteGroup({groupId: group.id})
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
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, scale: 0.9, y: 20}}
            whileHover={{scale: 1.02, rotate: 0}}
            transition={{duration: 0.2}}
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
                        <CardTitle
                            className={`text-3xl font-black uppercase tracking-tight leading-tight ${isDark ? 'text-white' : 'text-black'}`}>
                            {group.name}
                        </CardTitle>
                        {group.isDrawn ? (
                            <Badge variant={"success"} size={"small"}><CheckIcon/> Klaar</Badge>
                        ) : (
                            <Badge variant={"outline"} size={"small"}><Sparkles/> Nieuw</Badge>
                        )}
                    </div>

                </CardHeader>

                <CardContent className="relative space-y-4 pt-4">
                    <div className="space-y-2">
                        <div
                            className={`flex items-center gap-3 px-3 py-2 border-2 border-black ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                            <Users className="w-5 h-5"/>
                            <span className={`font-black uppercase text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                                {participantCount} Deelnemers
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 ">
                        <Button asChild variant={"outline"} className={"flex-1"}>
                            <Link href={`/trekking/${group.id}`}>
                                Bekijk <ArrowRight/>
                            </Link>
                        </Button>
                        <Button onClick={() => {
                            setDeleteError(null);
                            setShowDeleteDialog(true);
                        }} variant={"destructive"}>
                            {isDeleting ? <Loader2 className="animate-spin"/> : <Trash2/>}
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