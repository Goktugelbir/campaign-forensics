import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { FileSearch } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: { label: string; href?: string; onClick?: () => void };
  compact?: boolean;
}

/** Icon + sentence + one action (page map, group E #22). */
export function EmptyState({ title, description, icon: Icon = FileSearch, action, compact }: Props) {
  return (
    <div className={`card flex flex-col items-center text-center ${compact ? "px-6 py-10" : "px-6 py-16"}`}>
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-strong text-amber">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <p className="mt-4 font-serif text-2xl text-fg">{title}</p>
      {description && <p className="mt-2 max-w-md text-sm">{description}</p>}
      {action &&
        (action.href ? (
          <Link href={action.href} className="btn-ghost btn-sm mt-6">
            {action.label}
          </Link>
        ) : (
          <button type="button" onClick={action.onClick} className="btn-ghost btn-sm mt-6">
            {action.label}
          </button>
        ))}
    </div>
  );
}
