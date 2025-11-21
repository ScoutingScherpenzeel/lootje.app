"use server";

import {revalidatePath} from "next/cache";
import {headers} from "next/headers";
import {and, desc, eq} from "drizzle-orm";
import {db} from "@/db";
import {groups} from "@/db/schema/schema";
import {auth} from "@/lib/auth";

/**
 * Fetches all groups owned by a specific user along with the count of participants in each group.
 * @param userId ID of the user whose groups are to be fetched.
 * @returns An array of groups with participant counts.
 */
export const getGroupsForUser = async (userId: string) => {
    const groupsWithParticipants = await db.query.groups.findMany({
        where: eq(groups.ownerId, userId),
        with: {
            participants: {
                columns: {
                    id: true,
                },
            },
        },
        orderBy: (group) => [desc(group.createdAt)],
    });

    return groupsWithParticipants.map(({participants, ...group}) => ({
        ...group,
        participantCount: participants.length,
    }));
};

type CreateGroupInput = {
    name: string;
};

/**
 * Creates a new group with the specified name for the authenticated user.
 * @param name Name of the group to be created.
 * @returns The newly created group.
 */
export const createGroup = async ({name}: CreateGroupInput) => {
    const trimmedName = name.trim();

    if (!trimmedName) {
        throw new Error("Groepsnaam is verplicht");
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        throw new Error("Je moet ingelogd zijn om een groep aan te maken.");
    }

    const [group] = await db
        .insert(groups)
        .values({
            name: trimmedName,
            ownerId: session.user.id,
        })
        .returning();

    revalidatePath("/");

    return group;
};

type DeleteGroupInput = {
    groupId: string;
};

/**
 * Deletes a group owned by the authenticated user.
 * @param groupId ID of the group to be deleted.
 * @returns The deleted group.
 */
export const deleteGroup = async ({groupId}: DeleteGroupInput) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        throw new Error("Je moet ingelogd zijn om een groep te verwijderen.");
    }

    const [deletedGroup] = await db
        .delete(groups)
        .where(and(eq(groups.id, groupId), eq(groups.ownerId, session.user.id)))
        .returning();

    if (!deletedGroup) {
        throw new Error("Groep niet gevonden of je hebt geen toegang.");
    }

    revalidatePath("/");

    return deletedGroup;
};