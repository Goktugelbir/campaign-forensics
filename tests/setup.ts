import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// next/navigation only works inside the Next runtime; components get a controllable fake.
vi.mock("next/navigation", async () => {
  const m = await import("./navMock");
  return {
    useRouter: () => m.router,
    usePathname: () => m.nav.pathname,
    useSearchParams: () => m.nav.search,
    notFound: () => {
      throw new Error("NEXT_NOT_FOUND");
    },
  };
});

if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};
// jsdom does not implement window scrolling.
window.scrollTo = () => {};
