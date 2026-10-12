import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportView } from "@/components/report/ReportView";
import { parseTab, reportHref } from "@/components/report/ReportNav";
import { pickBeforeImage } from "@/components/report/RelaunchTab";
import { ToastProvider } from "@/components/Toast";
import { mockBundle } from "./fixtures";
import { pickOption } from "./select";
import { router, setUrl } from "./navMock";
import type { CaseBundle } from "@/lib/types";

function renderReport(bundle: CaseBundle = mockBundle(), search = "") {
  setUrl(`/cases/${bundle.case.slug}`, search);
  return render(
    <ToastProvider>
      <ReportView bundle={bundle} />
    </ToastProvider>,
  );
}

describe("report helpers", () => {
  it("parseTab falls back to case", () => {
    expect(parseTab("evidence")).toBe("evidence");
    expect(parseTab("nope")).toBe("case");
    expect(parseTab(null)).toBe("case");
  });
  it("reportHref keeps the tab in the query and the evidence id in the hash", () => {
    expect(reportHref("demo-mock")).toBe("/cases/demo-mock");
    expect(reportHref("demo-mock", "diagnosis")).toBe("/cases/demo-mock?tab=diagnosis");
    expect(reportHref("demo-mock", "evidence", "ev_014")).toBe("/cases/demo-mock?tab=evidence#ev_014");
  });
  it("pickBeforeImage prefers the launched (new) visual", () => {
    expect(pickBeforeImage(mockBundle())?.src).toBe("/cases/demo-mock/new-wordmark.svg");
  });
});

describe("ReportView header", () => {
  it("shows case code, type, launch date, badges, disclaimer and actions", () => {
    renderReport();
    expect(screen.getByText(/Case CF-0412 · Rebrand · Launched 14 AUG 2026/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Northwind Coffee — Logo refresh" })).toBeInTheDocument();
    expect(screen.getAllByText(/mock data/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText(/Not affiliated with Northwind Coffee/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /download json/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /print/i })).toHaveAttribute("href", "/cases/demo-mock/print");
  });

  it("hides the mock badge for a real case", () => {
    renderReport(mockBundle({ isMock: false }));
    expect(screen.queryByText(/mock data/i)).toBeNull();
  });

  it("copies the link and confirms with a toast", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    renderReport();
    await userEvent.click(screen.getByRole("button", { name: /copy link/i }));
    expect(writeText).toHaveBeenCalledWith(window.location.href);
    expect(await screen.findByText("Link copied")).toBeInTheDocument();
  });
});

describe("ReportView tabs", () => {
  it("shows the four numbered steps with their questions, the evidence count and the case tab by default", () => {
    renderReport();
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toEqual([
      "01CaseWhat happened?",
      "02Evidence40What did people say?",
      "03DiagnosisWhy did it backfire?",
      "04RelaunchHow do we fix it?",
    ]);
    expect(screen.getByRole("tab", { name: /case/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Key questions")).toBeInTheDocument();
  });

  it("pushes the tab into the URL when a tab is clicked", async () => {
    renderReport();
    await userEvent.click(screen.getByRole("tab", { name: /diagnosis/i }));
    expect(router.push).toHaveBeenCalledWith("/cases/demo-mock?tab=diagnosis", { scroll: false });
  });

  it("renders the tab named in ?tab=", () => {
    renderReport(mockBundle(), "tab=diagnosis");
    expect(screen.getByText("Exhibit A — Main cause")).toBeInTheDocument();
    expect(screen.getByText("Generic test · Passed")).toBeInTheDocument();
    expect(screen.getByText(/2 confirmed/)).toBeInTheDocument();
    expect(screen.getByText(/1 uncertain/)).toBeInTheDocument();
    expect(screen.getByText(/3 rejected/)).toBeInTheDocument();
    expect(screen.getByText("Exhibit B — Surprising finding")).toBeInTheDocument();
  });

  it("orders hypothesis cards confirmed → uncertain → rejected", () => {
    renderReport(mockBundle(), "tab=diagnosis");
    const labels = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(labels).toEqual([
      "H5 · Creative Execution",
      "H4 · Message",
      "H2 · Target Audience",
      "H1 · Positioning",
      "H3 · Differentiation",
      "H6 · Competition",
    ]);
  });

  it("evidence id click navigates to the Evidence tab with the id in the hash", async () => {
    renderReport(mockBundle(), "tab=diagnosis");
    const exhibit = screen.getByText("Exhibit A — Main cause").closest("section")!;
    await userEvent.click(within(exhibit).getByRole("link", { name: "ev_014" }));
    expect(router.push).toHaveBeenCalledWith("/cases/demo-mock?tab=evidence#ev_014", { scroll: false });
  });

  it("scrolls to and flashes the focused evidence card, clearing filters that hide it", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame"] });
    const advance = async (ms: number) => {
      for (let t = 0; t < ms; t += 20) await act(async () => void vi.advanceTimersByTime(20));
    };
    try {
      const scroll = vi.spyOn(Element.prototype, "scrollIntoView");
      window.location.hash = "#ev_014";
      renderReport(mockBundle(), "tab=evidence");
      await advance(120); // two animation frames: re-render, then scroll + flash
      const card = document.getElementById("ev_014")!;
      expect(scroll).toHaveBeenCalledTimes(1);
      expect(scroll.mock.contexts[0]).toBe(card);
      expect(card).toHaveClass("animate-flash");
      await advance(2100);
      expect(card).not.toHaveClass("animate-flash");
    } finally {
      vi.useRealTimers();
      window.location.hash = "";
    }
  });

  it("re-shows a card hidden by the current filters before flashing it", async () => {
    renderReport(mockBundle(), "tab=evidence");
    await pickOption(screen.getByRole("combobox", { name: /source/i }), "Competitor");
    expect(document.getElementById("ev_014")).toBeNull();
    await act(async () => {
      window.location.hash = "#ev_014";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(await screen.findByText("Showing 40 of 40")).toBeInTheDocument();
    expect(document.getElementById("ev_014")).not.toBeNull();
    window.location.hash = "";
  });

  it("evidence filters narrow the list and show an empty state", async () => {
    renderReport(mockBundle(), "tab=evidence");
    expect(screen.getByText("Showing 40 of 40")).toBeInTheDocument();
    await pickOption(screen.getByRole("combobox", { name: /source/i }), "Competitor");
    expect(screen.getByText("Showing 3 of 40")).toBeInTheDocument();
    await userEvent.type(screen.getByRole("searchbox"), "zzzz-nothing");
    expect(screen.getByText("No evidence matches these filters")).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole("button", { name: /clear filters/i })[0]);
    expect(screen.getByText("Showing 40 of 40")).toBeInTheDocument();
  });

  it("evidence tab shows source and sentiment charts and the data-use link", () => {
    renderReport(mockBundle(), "tab=evidence");
    expect(screen.getByText(/Sources · 8 types/)).toBeInTheDocument();
    expect(screen.getByText(/Sentiment · 40 items/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /how we handle public data/i })).toHaveAttribute("href", "/legal/data-sources");
  });

  it("relaunch tab shows prescription, brief, concept note, video placeholder and before/after", () => {
    renderReport(mockBundle(), "tab=relaunch");
    expect(screen.getByText("What to change, and why.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Creative brief" })).toBeInTheDocument();
    expect(screen.getAllByText("Concept based on diagnosis — not an official Northwind Coffee design.").length).toBe(2);
    expect(screen.getByText("Relaunch video in production")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(6); // header + 5 rows
    expect(screen.getByRole("slider", { name: /compare/i })).toBeInTheDocument();
  });

  it("shows 'in progress' instead of crashing when step files are missing", () => {
    const partial = mockBundle({ evidence: null, diagnosis: null, creative: null });
    renderReport(partial, "tab=evidence");
    expect(screen.getByText("Evidence in progress")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /evidence/i }).textContent).toContain("Evidence0");
    expect(screen.getByText(/Evidence collection in progress/)).toBeInTheDocument();
  });

  it("diagnosis and relaunch tabs also degrade gracefully", () => {
    const partial = mockBundle({ diagnosis: null });
    const { unmount } = renderReport(partial, "tab=diagnosis");
    expect(screen.getByText("Diagnosis in progress")).toBeInTheDocument();
    unmount();
    renderReport(partial, "tab=relaunch");
    expect(screen.getByText("Relaunch in progress")).toBeInTheDocument();
  });

  it("links back to all reports and offers the next step at the bottom of each tab", async () => {
    renderReport();
    expect(screen.getByRole("link", { name: /all reports/i })).toHaveAttribute("href", "/cases");
    const pager = screen.getByRole("navigation", { name: "Previous and next step" });
    const next = within(pager).getByRole("link", { name: /next step/i });
    expect(next).toHaveAttribute("href", "/cases/demo-mock?tab=evidence");
    await userEvent.click(next);
    expect(router.push).toHaveBeenCalledWith("/cases/demo-mock?tab=evidence", { scroll: false });
  });

  it("ends the last step with a Start a case prompt instead of a next step", () => {
    renderReport(mockBundle(), "tab=relaunch");
    const pager = screen.getByRole("navigation", { name: "Previous and next step" });
    expect(within(pager).getByRole("link", { name: /previous/i })).toHaveAttribute("href", "/cases/demo-mock?tab=diagnosis");
    expect(within(pager).getByRole("link", { name: /start a case/i })).toHaveAttribute("href", "/new");
  });

  it("always ends with the disclaimer link", () => {
    renderReport();
    expect(screen.getByRole("link", { name: /read the full disclaimer/i })).toHaveAttribute("href", "/legal/disclaimer");
  });
});
