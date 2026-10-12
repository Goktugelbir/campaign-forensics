import Image from "next/image";
import { SITE } from "@/lib/site";

/** Brand mark (public/brand/logo-mark.png) + name. .logo-mark blends it into both themes (globals.css). */
export function Logo({ className = "", showName = true }: { className?: string; showName?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image src="/brand/logo-mark.png" alt="" width={28} height={28} priority className="logo-mark h-7 w-7" />
      {showName && <span className="font-serif text-xl leading-none">{SITE.name}</span>}
    </span>
  );
}
