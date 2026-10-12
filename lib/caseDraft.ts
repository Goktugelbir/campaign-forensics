import type { CampaignType, Case } from "./types";

export interface CaseFormValues {
  brand: string;
  campaign: string;
  campaign_type: CampaignType | "";
  launch_date: string; // yyyy-mm-dd, typed into the launch date field
  urls: string[];
  claim: string;
  competitors: string;
  email: string;
  authorized: boolean;
}

export const EMPTY_FORM: CaseFormValues = {
  brand: "",
  campaign: "",
  campaign_type: "",
  launch_date: "",
  urls: [""],
  claim: "",
  competitors: "",
  email: "",
  authorized: false,
};

export type FormErrors = Partial<Record<keyof CaseFormValues | `urls.${number}`, string>>;

export interface ValidationResult {
  errors: FormErrors;
  warnings: { launch_date?: string };
  valid: boolean;
}

export function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    return (u.protocol === "http:" || u.protocol === "https:") && u.hostname.includes(".");
  } catch {
    return false;
  }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** `today` is injected (yyyy-mm-dd) so validation is deterministic in tests. */
export function validateCaseForm(v: CaseFormValues, today: string): ValidationResult {
  const errors: FormErrors = {};
  const warnings: ValidationResult["warnings"] = {};

  if (!v.brand.trim()) errors.brand = "Brand is required.";
  if (!v.campaign.trim()) errors.campaign = "Campaign name is required.";
  if (!v.campaign_type) errors.campaign_type = "Choose a campaign type.";

  if (!v.launch_date) errors.launch_date = "Launch date is required.";
  else if (!ISO_DATE.test(v.launch_date) || Number.isNaN(Date.parse(v.launch_date)))
    errors.launch_date = "Use a valid date.";
  else if (v.launch_date > today)
    warnings.launch_date = "This date is in the future — we can only analyze reactions that already exist.";

  const filled = v.urls.map((u) => u.trim()).filter(Boolean);
  if (filled.length === 0) errors["urls.0"] = "Add at least one campaign URL.";
  v.urls.forEach((u, i) => {
    if (u.trim() && !isValidUrl(u)) errors[`urls.${i}`] = "Enter a full URL starting with https://";
  });

  if (v.email.trim() && !EMAIL.test(v.email.trim())) errors.email = "Enter a valid e-mail address.";
  if (!v.authorized) errors.authorized = "Please confirm you are authorized to request this analysis.";

  return { errors, warnings, valid: Object.keys(errors).length === 0 };
}

/** ASCII slug: "Lay's — Global Rebrand" + 2026 → "lays-global-rebrand-2026". */
export function slugify(...parts: string[]): string {
  return parts
    .join(" ")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/['’]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

function splitList(s: string): string[] {
  return s
    .split(/[\n,;]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

/** Builds the case.json draft the engine (Manus) picks up. Only call with valid values. */
export function buildCaseDraft(v: CaseFormValues): Case {
  const year = v.launch_date.slice(0, 4);
  const urls = v.urls.map((u) => u.trim()).filter(Boolean);
  return {
    slug: slugify(v.brand, v.campaign, year),
    brand: v.brand.trim(),
    campaign: v.campaign.trim(),
    campaign_type: (v.campaign_type || "other") as CampaignType,
    launch_date: v.launch_date,
    summary: "",
    claim: v.claim.trim(),
    comparison_targets: splitList(v.competitors),
    key_questions: [],
    assets: urls.map((url, i) => ({ label: `Campaign URL ${i + 1}`, url })),
    status: "draft",
  };
}
