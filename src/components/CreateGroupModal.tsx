"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift, Loader2, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function CreateGroupModal({
  open,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateGroupModalProps) {
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
      <DialogContent className="border-8 border-black bg-yellow-400 p-0 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] sm:max-w-[550px]">
        <DialogHeader className="border-b-8 border-white bg-black p-6 text-white">
          <div className="mb-2 flex items-center gap-4">
            <div className="flex h-12 w-12 -rotate-6 transform items-center justify-center border-4 border-white bg-red-600">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight text-white uppercase">
              Nieuwe trekking
            </DialogTitle>
          </div>
          <DialogDescription className="text-base font-bold text-white/80">
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
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="bijv. SINTERKERST 2025"
              required
              className="h-14 border-4 border-black bg-white text-lg font-bold focus:border-black focus:ring-0"
            />
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row *:sm:flex-1">
            <Button
              variant={"outline"}
              onClick={() => onClose(false)}
              disabled={isLoading}
            >
              Annuleren
            </Button>
            <Button variant={"destructive"}>
              Maak aan!
              {isLoading ? (
                <Loader2 className={"animate-spin"} />
              ) : (
                <PlusIcon />
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
