import DeelnemerView, {
  type ParticipantRevealViewProps,
} from "@/components/DeelnemerView";
import { getParticipantReveal } from "@/actions/groupDetailActions";
import type { Metadata } from "next";

// Disable caching; always fetch fresh data for reveal links.
export const revalidate = 0;
export const dynamic = "force-dynamic";

/** Route params */
type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

/** Raw participant reveal record type */
type ParticipantRevealRecord = Awaited<ReturnType<typeof getParticipantReveal>>;

/** Page metadata */
export const metadata: Metadata = {
  title: "Bekijk jouw lootje!",
  description:
    "Benieuwd wie jij getrokken hebt? Bekijk het hier met jouw unieke link. Ssst... bewaar dit geheim goed!",
};

/**
 * Maps a raw database record + token to the view props consumed by <DeelnemerView />.
 * Pure transformation (no side-effects).
 */
function toViewProps(
  record: ParticipantRevealRecord,
  token: string,
): ParticipantRevealViewProps {
  if (!record) return { status: "invalid" };

  const groupName = record.group?.name ?? null;
  const isDrawn = record.group?.isDrawn ?? false;

  if (!isDrawn || !record.assignedParticipant) {
    return {
      status: "not-drawn",
      participantName: record.name,
      groupName,
    };
  }

  return {
    status: "ready",
    participantName: record.name,
    assignedParticipantName: record.assignedParticipant.name,
    groupName,
    token,
  };
}

/**
 * Fetches the participant reveal record and safely converts it to view props.
 * Any error during fetch is treated as an invalid token.
 */
async function getViewProps(
  token: string,
): Promise<ParticipantRevealViewProps> {
  try {
    const record = await getParticipantReveal(token);
    return toViewProps(record, token);
  } catch {
    return { status: "invalid" };
  }
}

/**
 * Participant reveal page, transforms a token into one of three states:
 * invalid | not-drawn | ready. Delegates rendering to <DeelnemerView />.
 */
export default async function ParticipantRevealPage({ params }: PageProps) {
  const { token } = await params;
  const viewProps = await getViewProps(token);

  return (
    <>
      <DeelnemerView {...viewProps} />
    </>
  );
}
