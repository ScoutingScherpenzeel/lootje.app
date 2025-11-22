"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Gift, Loader2, PlusIcon} from "lucide-react";
import {Button} from "@/components/ui/button";

export type CreateGroupFormData = {
    name: string;
    description?: string;
    event_date?: string;
};

type CreateGroupModalProps = {
    open: boolean;
    onClose: (open: boolean) => void;
    onSubmit: (data: CreateGroupFormData) => void;
    isLoading?: boolean;
};

export default function CreateGroupModal({ open, onClose, onSubmit, isLoading = false }: CreateGroupModalProps) {
    const [formData, setFormData] = useState<CreateGroupFormData>({
        name: "",
        description: "",
        event_date: "",
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit({ ...formData });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-yellow-400 p-0">
                <DialogHeader className="bg-black text-white p-6 border-b-8 border-white">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 border-4 border-white bg-red-600 flex items-center justify-center transform -rotate-6">
                            <Gift className="w-6 h-6 text-white" />
                        </div>
                        <DialogTitle className="text-3xl font-black uppercase tracking-tight text-white">Nieuwe trekking</DialogTitle>
                    </div>
                    <DialogDescription className="text-white/80 font-bold text-base">
                        Vul de gegevens in voor je nieuwe trekking.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 p-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-base font-black uppercase">
                            Groepsnaam *
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="bijv. SINTERKERST 2025"
                            required
                            className="border-4 border-black h-14 font-bold text-lg focus:ring-0 focus:border-black bg-white"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 *:sm:flex-1">
                        <Button variant={"outline"} onClick={() => onClose(false)}
                                disabled={isLoading}>
                            Annuleren
                        </Button>
                        <Button variant={"destructive"}>
                            Maak aan!
                            {isLoading ? <Loader2 className={"animate-spin"}/> : <PlusIcon/> }
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}