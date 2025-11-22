"use client";

import {useState, useTransition} from "react";
import {useRouter} from "next/navigation";
import {Plus} from "lucide-react";
import CreateGroupModal from "./CreateGroupModal";
import {createGroup} from "@/actions/groupsAction";
import {Button} from "@/components/ui/button";

type CreateGroupFormValues = {
    name: string;
    description?: string;
    event_date?: string;
};

export default function NewGroup() {
    const router = useRouter();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isCreating, startTransition] = useTransition();

    const createGroupHandler = (data: CreateGroupFormValues) => {

        setErrorMessage(null);

        // Run the server action without blocking UI updates.
        startTransition(() => {
            createGroup({
                name: data.name,
            })
                .then(() => {
                    setShowCreateModal(false);
                    router.refresh();
                })
                .catch((error) => {
                    console.error("Failed to create group", error);
                    setErrorMessage("Er ging iets mis bij het aanmaken van je groep.");
                });
        });
    };

    return (
        <>
            <Button variant={"destructive"} size={"lg"} onClick={() => setShowCreateModal(true)}>
                <Plus/> Nieuwe trekking
            </Button>
            <CreateGroupModal
                open={showCreateModal}
                onClose={(nextOpen) => {
                    setShowCreateModal(nextOpen);
                    if (!nextOpen) {
                        setErrorMessage(null);
                    }
                }}
                onSubmit={createGroupHandler}
                isLoading={isCreating}
            />

            {errorMessage ? (
                <p className="mt-4 text-sm font-semibold text-red-600">{errorMessage}</p>
            ) : null}
        </>
    );
}