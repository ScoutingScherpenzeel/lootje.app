"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

import { cn } from "@/lib/utils";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import {Button} from "@/components/ui/button";

type LoginMethod = {
  provider: string;
  label: string;
  accentClass?: string;
  icon?: ReactNode;
  disabled?: boolean;
};

type LoginPromptProps = {
  className?: string;
  methods?: LoginMethod[];
  showBadge?: boolean;
};

const defaultMethods: LoginMethod[] = [
  {
    provider: "google",
    label: "Doorgaan met Google",
    accentClass: "bg-yellow-300 hover:bg-yellow-200 text-black",
    icon: <span className="font-black text-2xl leading-none text-black">G</span>,
  },
];

export default function LoginPrompt({ className, methods = defaultMethods, showBadge = true }: LoginPromptProps) {
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (provider: string, disabled?: boolean) => {
    if (disabled || activeProvider) {
      return;
    }

    setError(null);
    setActiveProvider(provider);

    try {
      await authClient.signIn.social({ provider: provider as never });
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Inloggen mislukt.");
    } finally {
      setActiveProvider(null);
    }
  };

  return (
    <div
      className={cn(
        "relative border-8 border-black bg-white px-8 py-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]",
        className,
      )}
    >
      {showBadge ? (
        <div className="absolute -top-6 left-6 inline-flex items-center gap-2 border-4 border-black bg-yellow-300 px-4 py-1 text-xs font-black uppercase tracking-[0.35em]">
          Start hier
        </div>
      ) : null}
      <div className="space-y-8 pt-6">
        <div className="space-y-3 text-left">
          <h2 className="text-4xl font-black uppercase leading-none tracking-tight">Log in om te starten</h2>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/60">
                We gebruiken je account alleen om je trekkingen op te slaan. Geen spam, beloofd.
          </p>
        </div>

        <div className="grid gap-4">
          {methods.map((method) => {
            const isLoading = activeProvider === method.provider;
            const accentClass = method.accentClass ?? "bg-yellow-300 hover:bg-yellow-200 text-black";
            return (
              <Button
                key={method.provider}
                type="button"
                onClick={() => handleSignIn(method.provider, method.disabled)}
                disabled={method.disabled || Boolean(activeProvider && !isLoading)}
                className={cn(
                  "flex h-20 w-full items-center gap-6 rounded-3xl border-4 border-black px-6 text-left text-lg font-black uppercase tracking-wide shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 ease-out hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
                  accentClass,
                  method.disabled
                    ? "cursor-not-allowed opacity-60 hover:translate-x-0 hover:translate-y-0 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                    : "",
                )}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-black bg-white/70 text-2xl">
                  {method.icon ?? <Sparkles className="h-6 w-6 text-black" />}
                </span>
                    <span className="flex-1 text-left text-lg font-black uppercase leading-tight text-black text-wrap">
                  {method.label}
                </span>
                {isLoading ? (
                  <Loader2 className="h-15 w-15 animate-spin text-black" />
                ) : method.disabled ? (
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/60">
                    Binnenkort
                  </span>
                ) : (
                  <ArrowRight className="h-15 w-15 text-black" />
                )}
              </Button>
            );
          })}
        </div>
        {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
