import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LevelIndicator, levelState } from "@/components/LevelIndicator";
import { BacklashMeter } from "@/components/BacklashMeter";
import { CaseCard } from "@/components/CaseCard";
import { BACK_TO_TOP_AFTER, FloatingActions } from "@/components/FloatingActions";
import { negativeShare } from "@/lib/scoring";
import { ev } from "./fixtures";

describe("levelState (NSLevelIndicator thresholds)", () => {
  it("higher is worse when critical > warning", () => {
    expect(levelState(10, 30, 50)).toBe("normal");
    expect(levelState(30, 30, 50)).toBe("warning");
    expect(levelState(49, 30, 50)).toBe("warning");
    expect(levelState(50, 30, 50)).toBe("critical");
  });

  it("lower is worse when critical < warning", () => {
    expect(levelState(80, 40, 20)).toBe("normal");
    expect(levelState(40, 40, 20)).toBe("warning");
    expect(levelState(15, 40, 20)).toBe("critical");
  });

  it("is normal without thresholds", () => {
    expect(levelState(99)).toBe("normal");
  });
});

describe("LevelIndicator", () => {
  it("discrete capacity fills partial segments and exposes a meter", () => {
    const { container } = render(<LevelIndicator style="discreteCapacity" segments={10} value={42} label="Backlash" warningValue={30} criticalValue={50} />);
    const meter = screen.getByRole("meter", { name: "Backlash" });
    expect(meter).toHaveAttribute("aria-valuenow", "42");
    expect(meter).toHaveAttribute("data-state", "warning");
    expect(container.querySelectorAll(".bg-amber")).toHaveLength(5); // 4.2 segments → 5
  });

  it("relevancy clamps and uses the given tone", () => {
    const { container } = render(<LevelIndicator style="relevancy" segments={20} value={150} label="Confidence" tone="bg-fg-muted" />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "100");
    expect(container.querySelectorAll(".bg-fg-muted")).toHaveLength(20);
  });
});

describe("Backlash score", () => {
  it("is the rounded share of negative evidence, null without evidence", () => {
    const items = [ev({ id: "ev_001", sentiment: "negative" }), ev({ id: "ev_002", sentiment: "neutral" }), ev({ id: "ev_003", sentiment: "positive" })];
    expect(negativeShare(items)).toBe(33);
    expect(negativeShare([])).toBeNull();
    expect(negativeShare(null)).toBeNull();
  });

  it("names the level and speaks the value", () => {
    render(<BacklashMeter share={55} />);
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: "Backlash" })).toHaveAttribute("aria-valuetext", "55% of collected evidence is negative — high");
  });

  it("shows on case cards when evidence exists", () => {
    const base = { slug: "a", code: "CF-0001", brand: "A", campaign: "C", type: "ad" as const, status: "done" as const, launchDate: "2026-01-01", evidenceCount: 3, mainCause: null, isMock: false };
    const { rerender } = render(<CaseCard c={{ ...base, negativeShare: 20 }} />);
    expect(screen.getByRole("meter", { name: "Backlash" })).toHaveAttribute("data-state", "normal");
    rerender(<CaseCard c={{ ...base, negativeShare: null }} />);
    expect(screen.queryByRole("meter")).toBeNull();
  });
});

describe("FloatingActions", () => {
  const scrollTo = (y: number) =>
    act(() => {
      Object.defineProperty(window, "scrollY", { value: y, configurable: true });
      fireEvent.scroll(window);
    });

  afterEach(() => scrollTo(0));

  it("opens a speed dial of three labelled actions and closes on Escape", async () => {
    render(<FloatingActions />);
    expect(screen.queryByRole("list", { name: "Quick actions" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Open quick actions" }));
    const links = screen.getAllByRole("link");
    expect(links.map((l) => [l.textContent, l.getAttribute("href")])).toEqual([
      ["Start a case", "/new"],
      ["Sample reports", "/cases"],
      ["Contact us", "/contact"],
    ]);
    expect(links[0]).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("list", { name: "Quick actions" })).toBeNull();
    expect(screen.getByRole("button", { name: "Open quick actions" })).toHaveFocus();
  });

  it(`shows back-to-top only past ${BACK_TO_TOP_AFTER}px of scroll`, () => {
    render(<FloatingActions />);
    expect(screen.queryByRole("button", { name: "Back to top" })).toBeNull();
    scrollTo(BACK_TO_TOP_AFTER);
    expect(screen.queryByRole("button", { name: "Back to top" })).toBeNull();
    scrollTo(BACK_TO_TOP_AFTER + 1);
    expect(screen.getByRole("button", { name: "Back to top" })).toBeInTheDocument();
  });
});
