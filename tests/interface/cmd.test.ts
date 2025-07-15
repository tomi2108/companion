import { beforeEach, describe, expect, test, vi } from "vitest";

import { clearConsole } from "@interface/cmd";

vi.mock("node:child_process", () => ({
  default: {
    spawnSync: vi.fn()
  }
}));

beforeEach(vi.clearAllMocks);

describe("clearConsole", () => {
  test("writes clear screen sequence to stdout", () => {
    const writeSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    clearConsole();
    expect(writeSpy).toHaveBeenCalledWith("\x1Bc");
    writeSpy.mockRestore();
  });
});

