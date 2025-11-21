import DeelnemerView, {
    type ParticipantRevealViewProps,
} from "@/components/DeelnemerView";
import {getParticipantReveal} from "@/actions/groupDetailActions";
import HideFooterOnMount from "@/components/HideFooterOnMount";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type PageProps = {
    params: {
        token: string;
    };
};

type ParticipantRevealRecord = Awaited<ReturnType<typeof getParticipantReveal>>;


function toViewProps(record: ParticipantRevealRecord, token: string): ParticipantRevealViewProps {
    if (!record) {
        return {status: "invalid"};
    }

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
        token
    };
}

export default async function ParticipantRevealPage({params}: PageProps) {
    const {token} = await params;
    const record = await getParticipantReveal(token);
    const viewProps = toViewProps(record, token);

    return (
        <>
            <HideFooterOnMount />
            <DeelnemerView {...viewProps}  />
        </>
    );
}
