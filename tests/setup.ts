import { afterAll, afterEach, beforeAll, vi } from "vitest";

import { MockConfig } from "@mocks/config";
import { ctx } from "@mocks/ctx";
import { server } from "@mocks/msw";

vi.mock("@lib/config", () => ({
  Config: MockConfig
}));

vi.mock("node:fs");
vi.mock("node:timers/promises");
vi.spyOn(process, "exit").mockReturnValue(undefined as never);

vi.mock("@lib/utils", async () => ({
  ...await vi.importActual("@lib/utils"),
  isGitRepo: vi.fn(() => true)
}));

vi.mock("simple-git", () => ({
  default: vi.fn(() => ({
    clone: vi.fn(),
    add: vi.fn(),
    commit: vi.fn().mockResolvedValue({ commit: "fake-commit" }),
    push: vi.fn(),
    fetch: vi.fn().mockResolvedValue({}),
    branch: vi.fn().mockResolvedValue({ all: [] }),
    log: vi.fn().mockResolvedValue({ all: [] }),
    getConfig: vi.fn().mockResolvedValue({ value: "https://gitlab.com/group/project.git" }),
    addRemote: vi.fn(),
    checkout: vi.fn(),
    stash: vi.fn().mockImplementation(async (_, callback) => callback && await callback()),
    stashList: vi.fn().mockResolvedValue({ total: 0 }),
    reset: vi.fn(),
    deleteLocalBranch: vi.fn(),
    checkoutLocalBranch: vi.fn(),
    pull: vi.fn(),
    branchLocal: vi.fn().mockResolvedValue({ current: "master", all: ["master"] })
  }))
}));

afterEach(() => {
  ctx.reset();
});

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
