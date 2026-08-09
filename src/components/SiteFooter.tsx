import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";
import { headers } from "next/headers";

export default async function SiteFooter() {
  const headerList = await headers();
  const pathname = headerList.get("x-current-path");

  // Do not render footer on /bekijk pages
  if (pathname?.startsWith("/bekijk")) {
    return null;
  }

  return (
    <footer className="border-t-8 border-black bg-white px-6 py-6 text-sm">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 text-center font-semibold text-black/70 uppercase sm:flex-row sm:text-left">
        <p>
          © {new Date().getFullYear()} Lootje.app — gemaakt met 💛 door <a href="https://github.com/MelvinSnijders">Melvin
          Snijders</a>
        </p>
      </div>
    </footer>
  );
}
