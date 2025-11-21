"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LoginPrompt from "@/components/LoginPrompt";
import { Gift, Mail, PartyPopper, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { DialogTitle } from "@radix-ui/react-dialog";

export default function LoggedOutCallToAction() {
  const [open, setOpen] = useState(false);
 
  return (
    <>
  <section className="rounded-md relative overflow-hidden border-8 border-black bg-linear-to-br from-yellow-200 via-orange-200 to-pink-200 px-10 py-16 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <div className="pointer-events-none absolute inset-0 opacity-15">
          <div className="absolute left-8 top-8 h-32 w-32 rounded-full border-4 border-black/40 bg-white/50" />
          <div className="absolute bottom-12 right-12 h-40 w-40 rotate-6 border-8 border-black/30 bg-green-400/50" />
          <div className="absolute -bottom-10 left-1/3 h-48 w-48 -rotate-12 border-8 border-black/20 bg-red-400/40" />
        </div>
        <div className="relative items-center gap-12">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 border-4 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.35em] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <Sparkles className="h-4 w-4" />
              Klaar om te starten?
            </div>
            <h2 className="text-5xl font-black uppercase leading-none tracking-tight text-black drop-shadow-[4px_4px_0_rgba(0,0,0,0.25)] lg:text-6xl">
              Maak je eerste trekking in een paar klikken
            </h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                type="button"
                onClick={() => setOpen(true)}
                className="h-14 gap-3 border-4 border-black bg-red-500 px-8 text-lg font-black uppercase text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-red-800 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <Gift className="h-5 w-5" />
                Start met lootjes trekken
              </Button>
            </div>
          </div>

         
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTitle>
            <span className="sr-only">Log in om te starten</span>
        </DialogTitle>
        <DialogContent className="max-w-2xl border-4 border-black bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
          <LoginPrompt
            showBadge={false}
            className="border-none bg-transparent px-0 py-0 shadow-none"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
