import { afterAll, afterEach, beforeAll, vi } from "vitest";

import { server } from "@mocks/msw";

vi.mock("node:fs");
vi.mock("node:timers/promises");
vi.spyOn(process, "exit").mockReturnValue(undefined as never);

vi.mock("@lib/utils", async () => ({
  ...await vi.importActual("@lib/utils"),
  isGitRepo: vi.fn().mockResolvedValue(true)
}));

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
