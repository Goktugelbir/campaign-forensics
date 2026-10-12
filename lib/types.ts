// Data contracts shared by the investigation engine (Manus) and the web app.
// Source of truth: CAMPAIGN_FORENSICS.md §5.

export type CampaignType = "ad" | "rebrand" | "launch" | "other";
export type CaseStatus = "draft" | "collecting" | "diagnosing" | "producing" | "done";

// data/cases/<slug>/case.json
export interface Case {
  slug: string; // "instagram-wordmark-2026"
  brand: string; // "Instagram"
  campaign: string; // "New wordmark / brand refresh"
  campaign_type: CampaignType;
  launch_date: string; // ISO date
  summary: string; // 2-3 sentences, what happened
  claim: string; // what the brand claimed with the campaign
  comparison_targets: string[]; // previous version, competitors
  key_questions: string[]; // case-specific investigation questions
  assets: { label: string; url: string }[]; // old visuals / video links
  status: CaseStatus;
  /** Optional display code, e.g. "CF-0412". Derived from the slug when absent. */
  case_code?: string;
}

// data/cases/<slug>/evidence.json
export interface EvidenceFile {
  case_slug: string;
  collected_at: string; // ISO datetime
  sources_summary: { source: string; count: number }[];
  evidence: Evidence[];
}

export type EvidenceSource =
  | "news"
  | "instagram"
  | "youtube"
  | "reddit"
  | "x"
  | "threads"
  | "web"
  | "competitor";

export type Sentiment = "negative" | "neutral" | "positive";

export interface Evidence {
  id: string; // "ev_001"
  source: EvidenceSource;
  type: "comment" | "news" | "discussion" | "ad" | "official";
  url: string; // REQUIRED, real source
  date: string | null;
  lang: "en" | "tr" | "other";
  text: string; // anonymous, max ~500 chars
  metrics?: { likes?: number; replies?: number; views?: number };
  sentiment?: Sentiment;
  tags?: string[];
}

// data/cases/<slug>/diagnosis.json
export type HypothesisName =
  | "Positioning"
  | "Target Audience"
  | "Differentiation"
  | "Message"
  | "Creative Execution"
  | "Competition";

export type HypothesisStatus = "confirmed" | "rejected" | "uncertain";

export interface Hypothesis {
  id: string; // "H1".."H6"
  name: HypothesisName;
  status: HypothesisStatus;
  confidence: number; // 0-100
  evidence_ids: string[];
  reasoning: string; // 2-3 sentences
}

export interface CreativeBrief {
  concept: string;
  message: string;
  audience: string;
  tone: string;
  scenes: string[]; // 3-4 scenes
  visual_direction: string;
  cta: string;
}

export interface DiagnosisFile {
  case_slug: string;
  hypotheses: Hypothesis[]; // exactly 6
  diagnosis: {
    main_cause: string; // one specific sentence
    explanation: string; // 3-5 sentences
    secondary_causes: string[];
    surprising_finding: string;
    /** Optional extension: evidence behind the surprising finding (Exhibit B). */
    surprising_evidence_ids?: string[];
    evidence_ids: string[];
  };
  prescription: { change: string; why: string; evidence_ids: string[] }[];
  creative_brief: CreativeBrief;
  before_after: { dimension: string; before: string; after: string }[];
  generic_check: { passed: boolean; note: string };
}

// data/cases/<slug>/creative.json
export interface CreativeAsset {
  kind: "image" | "video";
  label: string; // "Revised wordmark concept", "Relaunch video"
  path: string; // /cases/<slug>/... or URL; "" while still in production
  prompt_used: string;
  tool: "fal" | "manus";
  model?: string; // fal.ai model ID
}

export interface CreativeFile {
  case_slug: string;
  assets: CreativeAsset[];
}

/** Everything the report page needs. Missing files are null, never a crash. */
export interface CaseBundle {
  case: Case;
  evidence: EvidenceFile | null;
  diagnosis: DiagnosisFile | null;
  creative: CreativeFile | null;
  isMock: boolean;
}
