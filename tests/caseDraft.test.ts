import { buildCaseDraft, EMPTY_FORM, isValidUrl, slugify, validateCaseForm, type CaseFormValues } from "@/lib/caseDraft";

const TODAY = "2026-10-12";
const valid: CaseFormValues = {
  ...EMPTY_FORM,
  brand: "Lay's",
  campaign: "Global rebrand",
  campaign_type: "rebrand",
  launch_date: "2026-09-01",
  urls: ["https://example.com/launch"],
  claim: "Real potatoes",
  competitors: "Ruffles, Pringles\nPatos;  ",
  authorized: true,
};

describe("isValidUrl", () => {
  it.each(["https://example.com", "http://a.b/c?d=1", "  https://example.com/x  "])("accepts %s", (u) => expect(isValidUrl(u)).toBe(true));
  it.each(["example.com", "ftp://example.com", "https://localhost", "javascript:alert(1)", ""])("rejects %s", (u) =>
    expect(isValidUrl(u)).toBe(false),
  );
});

describe("validateCaseForm", () => {
  it("passes a complete form", () => {
    const r = validateCaseForm(valid, TODAY);
    expect(r.valid).toBe(true);
    expect(r.errors).toEqual({});
  });

  it("requires brand, campaign, type, date, one URL and the authorization box", () => {
    const r = validateCaseForm(EMPTY_FORM, TODAY);
    expect(r.valid).toBe(false);
    expect(Object.keys(r.errors).sort()).toEqual(["authorized", "brand", "campaign", "campaign_type", "launch_date", "urls.0"].sort());
  });

  it("treats whitespace-only fields as empty", () => {
    const r = validateCaseForm({ ...valid, brand: "   ", urls: ["  "] }, TODAY);
    expect(r.errors.brand).toBeDefined();
    expect(r.errors["urls.0"]).toBeDefined();
  });

  it("flags each malformed URL by index but allows empty extra rows", () => {
    const r = validateCaseForm({ ...valid, urls: ["https://ok.com", "not a url", ""] }, TODAY);
    expect(r.errors["urls.1"]).toMatch(/https/);
    expect(r.errors["urls.2"]).toBeUndefined();
    expect(r.errors["urls.0"]).toBeUndefined();
  });

  it("warns (does not block) on a future launch date", () => {
    const r = validateCaseForm({ ...valid, launch_date: "2026-12-01" }, TODAY);
    expect(r.valid).toBe(true);
    expect(r.warnings.launch_date).toMatch(/future/);
    expect(validateCaseForm({ ...valid, launch_date: TODAY }, TODAY).warnings.launch_date).toBeUndefined();
  });

  it("rejects a malformed date", () => {
    expect(validateCaseForm({ ...valid, launch_date: "2026-1-1" }, TODAY).errors.launch_date).toBeDefined();
  });

  it("validates the optional e-mail only when given", () => {
    expect(validateCaseForm({ ...valid, email: "" }, TODAY).errors.email).toBeUndefined();
    expect(validateCaseForm({ ...valid, email: "nope" }, TODAY).errors.email).toBeDefined();
    expect(validateCaseForm({ ...valid, email: "a@b.co" }, TODAY).errors.email).toBeUndefined();
  });
});

describe("slugify", () => {
  it("makes ASCII slugs, folding Turkish characters and apostrophes", () => {
    expect(slugify("Lay's", "Global Rebrand", "2026")).toBe("lays-global-rebrand-2026");
    expect(slugify("Çerezza", "Işıklı Kampanya")).toBe("cerezza-isikli-kampanya");
    expect(slugify("McDonald’s NL — AI Xmas!")).toBe("mcdonalds-nl-ai-xmas");
  });
  it("caps length without a trailing dash", () => {
    const s = slugify("a".repeat(59), "bbb");
    expect(s.length).toBeLessThanOrEqual(60);
    expect(s.endsWith("-")).toBe(false);
  });
});

describe("buildCaseDraft", () => {
  it("produces a contract-shaped draft case.json", () => {
    const c = buildCaseDraft({ ...valid, urls: ["https://example.com/launch", "", " https://example.com/ad "] });
    expect(c).toEqual({
      slug: "lays-global-rebrand-2026",
      brand: "Lay's",
      campaign: "Global rebrand",
      campaign_type: "rebrand",
      launch_date: "2026-09-01",
      summary: "",
      claim: "Real potatoes",
      comparison_targets: ["Ruffles", "Pringles", "Patos"],
      key_questions: [],
      assets: [
        { label: "Campaign URL 1", url: "https://example.com/launch" },
        { label: "Campaign URL 2", url: "https://example.com/ad" },
      ],
      status: "draft",
    });
  });
  it("never puts the requester's e-mail into the case file", () => {
    const c = buildCaseDraft({ ...valid, email: "someone@agency.com" });
    expect(JSON.stringify(c)).not.toContain("someone@agency.com");
  });
});
