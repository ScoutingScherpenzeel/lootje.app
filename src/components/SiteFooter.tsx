import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer
      data-site-footer
      className="border-t-8 border-black bg-white px-6 py-6 text-sm"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 text-center font-semibold text-black/70 uppercase sm:flex-row sm:text-left">
        <p>
          © {new Date().getFullYear()} Lootje.app — gemaakt met 💛 door Melvin
          Snijders
        </p>
        <Button asChild variant={"yellow"} size={"sm"}>
          <a
            href="https://tikkie.me/pay/drht82mirkof1fvjd122"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Coffee /> Trakteer op koffie
          </a>
        </Button>
      </div>
    </footer>
  );
}
