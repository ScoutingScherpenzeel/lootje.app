"use server";

import {revalidatePath} from "next/cache";
import {headers} from "next/headers";
import {auth} from "@/lib/auth";
import {db} from "@/db";
import {groups, participants} from "@/db/schema/schema";
import {and, eq} from "drizzle-orm";
import {randomBytes} from "crypto";

type GroupRow = typeof groups.$inferSelect;
type ParticipantRow = typeof participants.$inferSelect;

export type GroupDetailParticipant = ParticipantRow & {
    assignedParticipantName: string | null;
};

export type GroupDetailPayload = {
    group: GroupRow & { participantCount: number };
    participants: GroupDetailParticipant[];
};

const MIN_PARTICIPANTS_FOR_DRAW = 3;
const ASSIGNMENT_MAX_ATTEMPTS = 120;

/**
 * Ensures that the user is authenticated and returns their user ID.
 */
async function requireUserId() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        throw new Error("Je moet ingelogd zijn om dit te doen.");
    }

    return session.user.id;
}

/**
 * Fetches a group owned by the specified user.
 * @param groupId ID of the group to fetch.
 * @param ownerId ID of the owner user.
 * @returns The group with its participants, or null if not found.
 */
async function getOwnedGroup(groupId: string, ownerId: string) {
    return db.query.groups.findFirst({
        where: and(eq(groups.id, groupId), eq(groups.ownerId, ownerId)),
        with: {
            participants: {
                with: {
                    assignedParticipant: {
                        columns: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });
}


/**
 * Fetches the details of a group owned by the current user.
 * @param groupId The ID of the group to fetch.
 * @returns The group details and its participants, or null if not found.
 */
export async function getGroupDetail(groupId: string): Promise<GroupDetailPayload | null> {
    const ownerId = await requireUserId();

    const group = await getOwnedGroup(groupId, ownerId);

    if (!group) {
        return null;
    }

    const sanitizedParticipants = group.participants
        .map(({assignedParticipant, ...participant}) => ({
            ...participant,
            assignedParticipantName: assignedParticipant?.name ?? null,
        }))
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return {
        group: {
            id: group.id,
            name: group.name,
            ownerId: group.ownerId,
            isDrawn: group.isDrawn,
            drawnAt: group.drawnAt,
            createdAt: group.createdAt,
            updatedAt: group.updatedAt,
            participantCount: sanitizedParticipants.length,
        },
        participants: sanitizedParticipants,
    };
}

type AddParticipantInput = {
    groupId: string;
    name: string;
};

/**
 * Adds a new participant to a group.
 * @param groupId The ID of the group.
 * @param name The name of the participant to add.
 */
export async function addParticipant({groupId, name}: AddParticipantInput) {
    const ownerId = await requireUserId();
    const trimmedName = name.trim();

    if (!trimmedName) {
        throw new Error("Naam is verplicht.");
    }

    const group = await getOwnedGroup(groupId, ownerId);

    if (!group) {
        throw new Error("Groep niet gevonden of je hebt geen toegang.");
    }

    if (group.isDrawn) {
        throw new Error("Je kunt geen deelnemers toevoegen nadat er is geloot.");
    }

    const viewToken = randomBytes(16).toString("hex");

    await db.insert(participants).values({
        groupId,
        name: trimmedName,
        viewToken,
    });

    revalidatePath("/");
    revalidatePath(`/trekking/${groupId}`);
}

type RemoveParticipantInput = {
    groupId: string;
    participantId: string;
};


/**
 * Removes a participant from a group.
 * @param groupId The ID of the group.
 * @param participantId The ID of the participant to remove.
 */
export async function removeParticipant({groupId, participantId}: RemoveParticipantInput) {
    const ownerId = await requireUserId();

    const group = await getOwnedGroup(groupId, ownerId);

    if (!group) {
        throw new Error("Groep niet gevonden of je hebt geen toegang.");
    }

    if (group.isDrawn) {
        throw new Error("Je kunt geen deelnemers verwijderen nadat er is geloot.");
    }

    const participantExists = group.participants.some((p) => p.id === participantId);

    if (!participantExists) {
        throw new Error("Deelnemer niet gevonden.");
    }

    await db.delete(participants).where(eq(participants.id, participantId));

    revalidatePath("/");
    revalidatePath(`/trekking/${groupId}`);
}

type DrawGroupInput = {
    groupId: string;
};


/**
 * Performs the draw for a group, assigning each participant to another participant.
 * @param groupId The ID of the group to draw.
 */
export async function drawGroup({groupId}: DrawGroupInput) {
    const ownerId = await requireUserId();
    const group = await getOwnedGroup(groupId, ownerId);

    if (!group) {
        throw new Error("Groep niet gevonden of je hebt geen toegang.");
    }

    if (group.isDrawn) {
        throw new Error("Deze groep is al geloot.");
    }

    const participantList = group.participants;

    if (participantList.length < MIN_PARTICIPANTS_FOR_DRAW) {
        throw new Error(`Minimaal ${MIN_PARTICIPANTS_FOR_DRAW} deelnemers nodig.`);
    }

    const assignments = computeAssignments(participantList);

    if (!assignments) {
        throw new Error("Kon geen geldige loting maken. Probeer het opnieuw.");
    }

    const now = new Date();

    for (const assignment of assignments) {
        await db
            .update(participants)
            .set({
                assignedParticipantId: assignment.assignedParticipantId,
                updatedAt: now,
            })
            .where(eq(participants.id, assignment.participantId));
    }

    await db
        .update(groups)
        .set({
            isDrawn: true,
            drawnAt: now,
            updatedAt: now,
        })
        .where(eq(groups.id, groupId));

    revalidatePath("/");
    revalidatePath(`/trekking/${groupId}`);
}

type Assignment = {
    participantId: string;
    assignedParticipantId: string;
};

/**
 * Computes valid assignments for participants such that no participant is assigned to themselves.
 * @param participantList The list of participants to assign.
 * @returns An array of assignments or null if no valid assignment could be found.
 */
function computeAssignments(participantList: ParticipantRow[]): Assignment[] | null {
    if (participantList.length < MIN_PARTICIPANTS_FOR_DRAW) {
        return null;
    }

    for (let attempt = 0; attempt < ASSIGNMENT_MAX_ATTEMPTS; attempt++) {
        const shuffled = shuffle(participantList);
        const assignments: Assignment[] = [];
        let valid = true;

        for (let i = 0; i < participantList.length; i++) {
            const current = participantList[i];
            const target = shuffled[i];

            if (current.id === target.id) {
                valid = false;
                break;
            }

            assignments.push({
                participantId: current.id,
                assignedParticipantId: target.id,
            });
        }

        if (valid) {
            return assignments;
        }
    }

    return null;
}

/**
 * Fetches participant details for reveal using the provided token.
 * @param token The participant's view token.
 * @returns The participant details or null if not found.
 */
export async function getParticipantReveal(token: string) {
    if (!token) {
        return null;
    }

    return db.query.participants.findFirst({
        where: eq(participants.viewToken, token),
        columns: {
            id: true,
            name: true,
            createdAt: true,
        },
        with: {
            group: {
                columns: {
                    id: true,
                    name: true,
                    isDrawn: true,
                    drawnAt: true,
                },
            },
            assignedParticipant: {
                columns: {
                    id: true,
                    name: true,
                },
            },
        },
    });
}

/**
 * Sets the viewedAt timestamp for a participant.
 * @param token The token of the participant to mark as viewed.
 */
export async function markParticipantAsViewed(token: string) {

    if (!token) {
        return;
    }

    const now = new Date();
    await db
        .update(participants)
        .set({
            viewedAt: now,
            updatedAt: now,
        })
        .where(eq(participants.viewToken, token));
}


/**
 * Shuffles an array using the Fisher-Yates algorithm.
 * @param items The array to shuffle.
 * @returns A new array with the items shuffled.
 */
function shuffle<T>(items: T[]): T[] {
    const array = [...items];

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}
