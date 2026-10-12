import { caseCode, firstSentence } from "./format";
import type { CampaignType, CaseBundle, CaseStatus } from "./types";

/** What a case card needs — small enough to pass to client components. */
export interface CaseSummary {
  slug: string;
  code: string;
  brand: string;
  campaign: string;
  type: CampaignType;
  status: CaseStatus;
  launchDate: string;
  evidenceCount: number;
  mainCause: string | null;
  isMock: boolean;
}

export function toCaseSummary(b: CaseBundle): CaseSummary {
  return {
    slug: b.case.slug,
    code: caseCode(b.case.slug, b.case.case_code),
    brand: b.case.brand,
    campaign: b.case.campaign,
    type: b.case.campaign_type,
    status: b.case.status,
    launchDate: b.case.launch_date,
    evidenceCount: b.evidence?.evidence.length ?? 0,
    mainCause: b.diagnosis ? firstSentence(b.diagnosis.diagnosis.main_cause) : null,
    isMock: b.isMock,
  };
}
