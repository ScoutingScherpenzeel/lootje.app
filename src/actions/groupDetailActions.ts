"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { groups, participants } from "@/db/schema/schema";
import { and, eq } from "drizzle-orm";
import { randomBytes } from "crypto";

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

async function requireUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Je moet ingelogd zijn om dit te doen.");
  }

  return session.user.id;
}

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

export async function getGroupDetail(groupId: string): Promise<GroupDetailPayload | null> {
  const ownerId = await requireUserId();

  const group = await getOwnedGroup(groupId, ownerId);

  if (!group) {
    return null;
  }

  const sanitizedParticipants = group.participants
    .map(({ assignedParticipant, ...participant }) => ({
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

export async function addParticipant({ groupId, name }: AddParticipantInput) {
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

export async function removeParticipant({ groupId, participantId }: RemoveParticipantInput) {
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

export async function drawGroup({ groupId }: DrawGroupInput) {
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

function shuffle<T>(items: T[]): T[] {
  const array = [...items];

  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}
