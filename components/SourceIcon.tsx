import {
  AtSign,
  Camera,
  Globe,
  MessagesSquare,
  Newspaper,
  PlayCircle,
  MessageCircle,
  Swords,
  type LucideIcon,
} from "lucide-react";
import type { EvidenceSource } from "@/lib/types";

// Generic glyphs only — no platform logos (§7.6: brand logos are not used).
const ICONS: Record<EvidenceSource, LucideIcon> = {
  news: Newspaper,
  instagram: Camera,
  youtube: PlayCircle,
  reddit: MessagesSquare,
  x: MessageCircle,
  threads: AtSign,
  web: Globe,
  competitor: Swords,
};

export function SourceIcon({ source, className = "h-3.5 w-3.5" }: { source: EvidenceSource; className?: string }) {
  const Icon = ICONS[source] ?? Globe;
  return <Icon className={className} aria-hidden />;
}
