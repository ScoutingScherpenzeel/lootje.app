"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

export type DeleteGroupDialogProps = {
  groupName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  error?: string | null;
};

export default function DeleteGroupDialog({
  groupName,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  error,
}: DeleteGroupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-8 border-black bg-white p-0 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] sm:max-w-[480px]">
        <DialogHeader className="border-b-8 border-white bg-black p-6 text-white">
          <DialogTitle className="text-2xl font-black tracking-tight text-white uppercase">
            Trekking verwijderen
          </DialogTitle>
          <DialogDescription className="text-base font-bold text-white/80">
            Weet je zeker dat je &ldquo;{groupName}&rdquo; wil verwijderen?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-6 text-sm font-semibold">
          <p className="text-black">
            Deze actie verwijdert ook alle deelnemers en kan niet ongedaan
            worden gemaakt.
          </p>
          {error ? <p className="text-red-600">{error}</p> : null}
        </div>
        <DialogFooter className="gap-3 p-6 pt-0">
          <Button
            variant={"outline"}
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className={""}
          >
            Annuleren
          </Button>
          <Button
            variant={"destructive"}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className={"animate-spin"} /> : <Trash />}
            Verwijderen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
