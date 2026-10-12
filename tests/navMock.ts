import { vi } from "vitest";

/** Fake next/navigation state shared by tests/setup.ts and the component tests. */
export const router = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
  refresh: vi.fn(),
};

export const nav = { pathname: "/", search: new URLSearchParams() };

export function setUrl(pathname: string, search = "") {
  nav.pathname = pathname;
  nav.search = new URLSearchParams(search);
}
