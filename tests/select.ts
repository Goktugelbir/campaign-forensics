import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/** Picks an option from the custom <Select>: open the combobox, click the option by its label. */
export async function pickOption(combobox: HTMLElement, optionLabel: string | RegExp) {
  await userEvent.click(combobox);
  await userEvent.click(screen.getByRole("option", { name: optionLabel }));
}
