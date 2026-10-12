import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewCaseForm } from "@/components/NewCaseForm";
import { FEATURED_CASE_SLUG } from "@/lib/site";

const TODAY = "2026-10-12";

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^brand/i), "Lay's");
  await user.type(screen.getByLabelText(/campaign name/i), "Global rebrand");
  await user.click(screen.getByLabelText(/campaign type/i));
  await user.click(screen.getByRole("option", { name: "Rebrand" }));
  await user.type(screen.getByLabelText(/launch date/i), "2026-09-01");
  await user.type(screen.getByLabelText("Campaign URL 1"), "https://example.com/launch");
  await user.click(screen.getByRole("checkbox", { name: /i confirm/i }));
}

describe("NewCaseForm", () => {
  it("shows errors for every required field and focuses the first", async () => {
    const user = userEvent.setup();
    render(<NewCaseForm today={TODAY} />);
    await user.click(screen.getByRole("button", { name: /start investigation/i }));
    expect(screen.getByText("Brand is required.")).toBeInTheDocument();
    expect(screen.getByText("Campaign name is required.")).toBeInTheDocument();
    expect(screen.getByText("Choose a campaign type.")).toBeInTheDocument();
    expect(screen.getByText("Launch date is required.")).toBeInTheDocument();
    expect(screen.getByText("Add at least one campaign URL.")).toBeInTheDocument();
    expect(screen.getByText(/confirm you are authorized/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^brand/i)).toHaveFocus();
    expect(screen.getByLabelText(/^brand/i)).toHaveAttribute("aria-invalid", "true");
  });

  it("clears an error live once the user fixes the field", async () => {
    const user = userEvent.setup();
    render(<NewCaseForm today={TODAY} />);
    await user.click(screen.getByRole("button", { name: /start investigation/i }));
    await user.type(screen.getByLabelText(/^brand/i), "X");
    expect(screen.queryByText("Brand is required.")).toBeNull();
  });

  it("validates URL format and supports adding/removing URL rows", async () => {
    const user = userEvent.setup();
    render(<NewCaseForm today={TODAY} />);
    await user.click(screen.getByRole("button", { name: /add another url/i }));
    expect(screen.getByLabelText("Campaign URL 2")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Campaign URL 2"), "not-a-url");
    await user.click(screen.getByRole("button", { name: /start investigation/i }));
    expect(screen.getByText(/full URL starting with https/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove URL 2" }));
    expect(screen.queryByLabelText("Campaign URL 2")).toBeNull();
  });

  it("warns about a future launch date without blocking", async () => {
    const user = userEvent.setup();
    render(<NewCaseForm today={TODAY} />);
    await user.type(screen.getByLabelText(/launch date/i), "2027-01-01");
    expect(screen.getByText(/in the future/i)).toBeInTheDocument();
  });

  it("links to the GDPR notice and Terms", () => {
    render(<NewCaseForm today={TODAY} />);
    expect(screen.getByRole("link", { name: "GDPR notice" })).toHaveAttribute("href", "/legal/gdpr");
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/legal/terms");
  });

  it("queues the investigation and previews the case.json draft", async () => {
    const user = userEvent.setup();
    window.scrollTo = vi.fn();
    const createObjectURL = vi.fn(() => "blob:x");
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    render(<NewCaseForm today={TODAY} />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /start investigation/i }));

    expect(screen.getByText("Investigation queued")).toBeInTheDocument();
    expect(screen.getByText(/under 48 hours/i)).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Progress" }).children).toHaveLength(3);
    const preview = document.querySelector("pre")!.textContent!;
    const draft = JSON.parse(preview);
    expect(draft).toMatchObject({ slug: "lays-global-rebrand-2026", status: "draft", campaign_type: "rebrand" });
    expect(screen.getByRole("link", { name: /see a sample report/i })).toHaveAttribute("href", `/cases/${FEATURED_CASE_SLUG}`);

    await user.click(screen.getByRole("button", { name: /download/i }));
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: /start another case/i }));
    expect(screen.getByLabelText(/^brand/i)).toHaveValue("");
    click.mockRestore();
  });
});
