import { SITE } from "@/lib/site";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span aria-hidden className="h-2 w-2 rounded-full bg-amber" />
      <span className="font-serif text-xl leading-none">{SITE.name}</span>
    </span>
  );
}
