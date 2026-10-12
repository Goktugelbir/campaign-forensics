import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EvidenceCard, EVIDENCE_TEXT_LIMIT } from "@/components/EvidenceCard";
import { HypothesisCard, ConfidenceBar } from "@/components/HypothesisCard";
import { MockBadge, StatusBadge, GenericCheckBadge } from "@/components/Badges";
import { Accordion } from "@/components/Accordion";
import { CompareSlider } from "@/components/CompareSlider";
import { WaitlistForm } from "@/components/WaitlistForm";
import { CaseList, type CaseSummary } from "@/components/CaseList";
import { EmptyState } from "@/components/EmptyState";
import { ToastProvider } from "@/components/Toast";
import { buildDataRequestMailto } from "@/components/DataRequestForm";
import { buildContactMailto } from "@/components/ContactForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { setUrl } from "./navMock";
import { SITE } from "@/lib/site";
import { ev } from "./fixtures";
import { pickOption } from "./select";
import type { Hypothesis } from "@/lib/types";

describe("EvidenceCard", () => {
  it("shows id, source, date, tags, metrics and links only to the source post", () => {
    render(
      <EvidenceCard
        evidence={ev({
          id: "ev_014",
          source: "youtube",
          date: "2026-08-16",
          text: "Reads Norhwind",
          url: "https://example.com/watch/1",
          tags: ["readability", "nostalgia"],
          sentiment: "negative",
          metrics: { likes: 2870, replies: 0 },
        })}
        caseSlug="demo-mock"
      />,
    );
    const card = screen.getByRole("article", { name: "Evidence ev_014" });
    expect(card).toHaveAttribute("id", "ev_014");
    expect(within(card).getByText("ev_014")).toBeInTheDocument();
    expect(within(card).getByText("YouTube")).toBeInTheDocument();
    expect(within(card).getByText("16 AUG 2026")).toBeInTheDocument();
    expect(within(card).getByText("#readability")).toBeInTheDocument();
    expect(within(card).getByText("2.9K")).toBeInTheDocument();
    expect(within(card).queryByTitle("Replies")).toBeNull(); // zero metrics are hidden
    const open = within(card).getByRole("link", { name: /open source/i });
    expect(open).toHaveAttribute("href", "https://example.com/watch/1");
    expect(open).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(within(card).getByRole("link", { name: /report this evidence/i })).toHaveAttribute(
      "href",
      "/legal/data-request?evidence=ev_014&case=demo-mock",
    );
  });

  it(`truncates at ${EVIDENCE_TEXT_LIMIT} characters with Show more / Show less`, async () => {
    const long = "legibility ".repeat(80).trim();
    render(<EvidenceCard evidence={ev({ id: "ev_021", text: long })} />);
    const button = screen.getByRole("button", { name: "Show more" });
    expect(document.querySelector("blockquote")!.textContent!.length).toBeLessThanOrEqual(EVIDENCE_TEXT_LIMIT + 2);
    await userEvent.click(button);
    expect(document.querySelector("blockquote")!.textContent).toContain(long);
    expect(screen.getByRole("button", { name: "Show less" })).toHaveAttribute("aria-expanded", "true");
  });

  it("has no Show more for short text and no metrics/report link in compact mode", () => {
    render(<EvidenceCard evidence={ev({ id: "ev_001", metrics: { likes: 5 } })} compact />);
    expect(screen.queryByRole("button", { name: /show more/i })).toBeNull();
    expect(screen.queryByText(/report this evidence/i)).toBeNull();
    expect(screen.queryByTitle("Likes")).toBeNull();
  });

  it("applies the highlight animation when focused", () => {
    render(<EvidenceCard evidence={ev({ id: "ev_009" })} highlighted />);
    expect(screen.getByRole("article")).toHaveClass("animate-flash");
  });
});

const hyp = (over: Partial<Hypothesis> = {}): Hypothesis => ({
  id: "H5",
  name: "Creative Execution",
  status: "confirmed",
  confidence: 86,
  evidence_ids: ["ev_003", "ev_014"],
  reasoning: "The ligature collapses.",
  ...over,
});

describe("HypothesisCard", () => {
  it("renders label, status, confidence meter, reasoning and evidence links", () => {
    render(<HypothesisCard h={hyp()} slug="demo-mock" />);
    expect(screen.getByRole("heading", { name: "H5 · Creative Execution" })).toBeInTheDocument();
    expect(screen.getByText("confirmed")).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: "Confidence" })).toHaveAttribute("aria-valuenow", "86");
    expect(screen.getByText("The ligature collapses.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ev_003" })).toHaveAttribute("href", "/cases/demo-mock?tab=evidence#ev_003");
  });

  it("dims and strikes through rejected hypotheses", () => {
    const { container } = render(<HypothesisCard h={hyp({ status: "rejected", confidence: 12 })} />);
    expect(container.querySelector("article")).toHaveClass("opacity-70");
    expect(screen.getByRole("heading")).toHaveClass("line-through");
  });

  it("ConfidenceBar clamps out-of-range values", () => {
    render(<ConfidenceBar value={180} status="uncertain" />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "100");
  });
});

describe("Badges", () => {
  it("MockBadge reads MOCK DATA", () => {
    render(<MockBadge />);
    expect(screen.getByText(/mock data/i)).toBeInTheDocument();
  });
  it("StatusBadge and GenericCheckBadge show their state", () => {
    render(
      <>
        <StatusBadge status="collecting" />
        <GenericCheckBadge passed />
        <GenericCheckBadge passed={false} />
      </>,
    );
    expect(screen.getByText("Collecting")).toBeInTheDocument();
    expect(screen.getByText("Generic test · Passed")).toBeInTheDocument();
    expect(screen.getByText("Generic test · Failed")).toBeInTheDocument();
  });
});

describe("Accordion", () => {
  const items = [
    { q: "Q1", a: "A1" },
    { q: "Q2", a: "A2" },
  ];
  it("opens the first item by default and toggles one at a time", async () => {
    render(<Accordion items={items} />);
    expect(screen.getByText("A1")).toBeVisible();
    expect(screen.getByText("A2")).not.toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Q2" }));
    expect(screen.getByText("A2")).toBeVisible();
    expect(screen.getByText("A1")).not.toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Q2" }));
    expect(screen.getByText("A2")).not.toBeVisible();
  });
  it("can start fully closed", () => {
    render(<Accordion items={items} defaultOpen={null} />);
    expect(screen.getAllByRole("button").every((b) => b.getAttribute("aria-expanded") === "false")).toBe(true);
  });
});

describe("CompareSlider", () => {
  it("moves the wipe with the range input", () => {
    const { container } = render(
      <CompareSlider before={{ src: "/a.svg", label: "Launched" }} after={{ src: "/b.svg", label: "Revised" }} />,
    );
    const range = screen.getByRole("slider", { name: /compare/i });
    fireEvent.change(range, { target: { value: "20" } });
    const clip = container.querySelector<HTMLElement>("[style*='clip-path']")!;
    expect(clip.style.clipPath).toBe("inset(0 80% 0 0)");
  });
});

describe("WaitlistForm", () => {
  it("validates the e-mail, keeps the marketing box unticked and thanks the user", async () => {
    render(
      <ToastProvider>
        <WaitlistForm />
      </ToastProvider>,
    );
    const box = screen.getByRole("checkbox", { name: /product updates/i });
    expect(box).not.toBeChecked();
    await userEvent.click(screen.getByRole("button", { name: /join the waitlist/i }));
    expect(screen.getByText(/valid e-mail/i)).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText("E-mail"), "team@agency.com");
    await userEvent.click(screen.getByRole("button", { name: /join the waitlist/i }));
    expect(screen.getAllByText(/you.re on the list/i).length).toBeGreaterThan(0);
  });
});

describe("CaseList", () => {
  const base: CaseSummary = {
    slug: "a",
    code: "CF-0001",
    brand: "Alpha",
    campaign: "Rebrand",
    type: "rebrand",
    status: "done",
    launchDate: "2026-08-14",
    evidenceCount: 40,
    mainCause: "Cause.",
    isMock: true,
  };
  const real = { isMock: false };
  const cases = [
    base,
    { ...base, ...real, slug: "b", brand: "Beta", type: "ad" as const, status: "collecting" as const },
    { ...base, ...real, slug: "c", brand: "Gamma" },
    { ...base, ...real, slug: "d", brand: "Delta" },
  ];

  it("renders cards with badges and filters by type and status", async () => {
    render(<CaseList cases={cases} />);
    expect(screen.getAllByRole("link")).toHaveLength(4);
    expect(screen.getAllByText(/mock data/i)).toHaveLength(1);
    await pickOption(screen.getByRole("combobox", { name: /type/i }), "Ad");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/cases/b");
    await pickOption(screen.getByRole("combobox", { name: /status/i }), "Done");
    expect(screen.getByText(/no cases match/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(screen.getAllByRole("link")).toHaveLength(4);
  });

  it("hides the filters while the list is short", () => {
    render(<CaseList cases={cases.slice(0, 2)} />);
    expect(screen.getAllByRole("link")).toHaveLength(2);
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.getAllByText("Open report")).toHaveLength(2);
  });

  it("shows the empty state with a Start a case action", () => {
    render(<CaseList cases={[]} />);
    expect(screen.getByText("No cases yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start a case" })).toHaveAttribute("href", "/new");
  });
});

describe("EmptyState", () => {
  it("renders a button action when no href is given", async () => {
    const onClick = vi.fn();
    render(<EmptyState title="Nothing" action={{ label: "Do it", onClick }} />);
    await userEvent.click(screen.getByRole("button", { name: "Do it" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe("mailto builders", () => {
  it("data request pre-fills subject and body", () => {
    const href = buildDataRequestMailto({ type: "Remove evidence", reference: "ev_014", description: "Please remove" });
    expect(href.startsWith(`mailto:${SITE.contactEmail}?subject=`)).toBe(true);
    const url = new URL(href);
    expect(url.searchParams.get("subject")).toBe("Data request: Remove evidence — ev_014");
    expect(url.searchParams.get("body")).toContain("Please remove");
  });
  it("contact form encodes special characters", () => {
    const url = new URL(buildContactMailto({ name: "Ayşe & Co", topic: "Agency demo", message: "a=b?c" }));
    expect(url.searchParams.get("subject")).toBe("Agency demo — Ayşe & Co");
    expect(url.searchParams.get("body")).toBe("a=b?c");
  });
});

describe("SiteFooter", () => {
  it("credits the tools from the spec and carries the brand disclaimer", () => {
    render(<SiteFooter />);
    expect(screen.getByText(/Built with Manus, Apify and fal\.ai/)).toBeInTheDocument();
    expect(screen.getByText(/not affiliated with any brand we analyze/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "GDPR Notice" })).toHaveAttribute("href", "/legal/gdpr");
  });
});

describe("SiteHeader", () => {
  it("marks the current section and opens/closes the mobile menu", async () => {
    setUrl("/cases/lays-rebrand");
    render(<SiteHeader />);
    const main = screen.getByRole("navigation", { name: "Main" });
    expect(within(main).getByRole("link", { name: "Sample reports" })).toHaveAttribute("aria-current", "page");
    expect(within(main).getByRole("link", { name: "Pricing" })).not.toHaveAttribute("aria-current");

    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const mobile = screen.getByRole("navigation", { name: "Mobile" });
    expect(within(mobile).getAllByRole("link")).toHaveLength(5);
    await userEvent.click(screen.getByRole("button", { name: "Close menu" }));
    expect(screen.queryByRole("navigation", { name: "Mobile" })).toBeNull();
    setUrl("/");
  });
});

describe("StepsMarquee", () => {
  it("exposes the four steps once; the looping copies are hidden and unfocusable", async () => {
    const { StepsMarquee } = await import("@/components/StepsMarquee");
    const { container } = render(<StepsMarquee slug="lays-rebrand" />);
    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "/cases/lays-rebrand",
      "/cases/lays-rebrand?tab=evidence",
      "/cases/lays-rebrand?tab=diagnosis",
      "/cases/lays-rebrand?tab=relaunch",
    ]);
    const copies = container.querySelectorAll('ol[aria-hidden="true"] a');
    expect(copies.length).toBeGreaterThan(0);
    copies.forEach((a) => expect(a).toHaveAttribute("tabindex", "-1"));
  });
});

describe("Checkboxes", () => {
  it("use the custom checkbox style and toggle from the whole label row", async () => {
    render(
      <ToastProvider>
        <WaitlistForm />
      </ToastProvider>,
    );
    const box = screen.getByRole("checkbox");
    expect(box).toHaveClass("checkbox");
    expect(box.closest("label")).toHaveClass("checkbox-row");
    await userEvent.click(screen.getByText(/send me product updates/i));
    expect(box).toBeChecked();
  });
});

describe("ThemeToggle", () => {
  it("slides between dark and light, sets data-theme and remembers the choice", async () => {
    const { ThemeToggle, THEME_KEY } = await import("@/components/ThemeToggle");
    document.documentElement.dataset.theme = "dark";
    localStorage.clear();
    render(<ThemeToggle />);
    const sw = screen.getByRole("switch", { name: "Light theme" });
    expect(sw).toHaveAttribute("aria-checked", "false");

    await userEvent.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem(THEME_KEY)).toBe("light");

    await userEvent.click(sw);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");
  });

  it("picks up a theme already applied before hydration", async () => {
    const { ThemeToggle } = await import("@/components/ThemeToggle");
    document.documentElement.dataset.theme = "light";
    render(<ThemeToggle />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
    document.documentElement.dataset.theme = "dark";
  });

  it("the head script only accepts 'light' or 'dark'", async () => {
    const { THEME_INIT_SCRIPT, THEME_KEY } = await import("@/components/ThemeToggle");
    document.documentElement.dataset.theme = "dark";
    localStorage.setItem(THEME_KEY, "<script>");
    new Function(THEME_INIT_SCRIPT)();
    expect(document.documentElement.dataset.theme).toBe("dark");
    localStorage.setItem(THEME_KEY, "light");
    new Function(THEME_INIT_SCRIPT)();
    expect(document.documentElement.dataset.theme).toBe("light");
    document.documentElement.dataset.theme = "dark";
    localStorage.clear();
  });
});
