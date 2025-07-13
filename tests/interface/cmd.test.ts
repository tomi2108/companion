import { clearConsole } from "@interface/cmd";
import { describe, test, expect, vi, beforeEach } from "vitest";

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

