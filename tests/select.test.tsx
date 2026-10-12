import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Select } from "@/components/Select";

const OPTIONS = [
  { value: "info", label: "Information" },
  { value: "fix", label: "Correction" },
  { value: "del", label: "Deletion" },
];

function Harness({ initial = "info" }: { initial?: string }) {
  const [v, setV] = useState(initial);
  return (
    <>
      <Select aria-label="Request type" value={v} onChange={setV} options={OPTIONS} />
      <output data-testid="value">{v}</output>
    </>
  );
}

describe("Select", () => {
  it("shows the selected label and picks an option with the mouse", async () => {
    render(<Harness />);
    const box = screen.getByRole("combobox", { name: "Request type" });
    expect(box).toHaveTextContent("Information");
    expect(box).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(box);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Information" })).toHaveAttribute("aria-selected", "true");
    await userEvent.click(screen.getByRole("option", { name: "Deletion" }));
    expect(screen.getByTestId("value")).toHaveTextContent("del");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("works from the keyboard: arrows, Enter, Escape and type-ahead", async () => {
    render(<Harness />);
    const box = screen.getByRole("combobox");
    box.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(box).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(screen.getByTestId("value")).toHaveTextContent("fix");

    await userEvent.keyboard("{ArrowDown}d{Enter}");
    expect(screen.getByTestId("value")).toHaveTextContent("del");

    await userEvent.keyboard("{ArrowDown}{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByTestId("value")).toHaveTextContent("del");
  });

  it("shows a placeholder when nothing is selected and closes on outside click", async () => {
    render(<Harness initial="" />);
    const box = screen.getByRole("combobox");
    expect(box).toHaveTextContent("Select…");
    await userEvent.click(box);
    await userEvent.click(document.body);
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});
