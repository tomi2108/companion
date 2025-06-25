import "../mocks/config";
import { describe, test, expect, vi, beforeEach } from "vitest";
import cp from "node:child_process";
import { executeScript, clearConsole } from "../../src/interface/cmd";

vi.mock("node:child_process", () => ({
  default: {
    spawnSync: vi.fn()
  }
}));

beforeEach(vi.clearAllMocks);

describe("executeScript", () => {
  const mockSpawnSync = cp.spawnSync as unknown as ReturnType<typeof vi.fn>;

  test("executes script with default path and returns stdout", () => {
    mockSpawnSync.mockReturnValue({ stdout: Buffer.from("output") });

    const result = executeScript("test.sh");

    expect(mockSpawnSync).toHaveBeenCalledWith(
      "/mock/scripts/test.sh",
      undefined,
      expect.objectContaining({
        cwd: undefined,
        env: expect.objectContaining({
          SCRIPTS_REPO_PATH: "/mock/scripts",
          NODE_OPTIONS: "--max-old-space-size=8192",
          TKN: "tkn --kubeconfig=/mock/kube/config",
          JIRA_PROJECT_KEY: "PROJ",
          JIRA_USER: "jira_user",
          JIRA_API_TOKEN: "jira_token",
          JIRA_DOMAIN: "jira.example.com",
          LOGS_PATH: "/mock/logs",
          BROWSER: "firefox",
          EDITOR: "nano"
        }),
        stdio: ["inherit", "inherit", "inherit"]
      })
    );

    expect(result).toBe("output");
  });

  test("uses provided options and suppresses stdout", () => {
    mockSpawnSync.mockReturnValue({ stdout: Buffer.from("hidden output") });

    const result = executeScript("run.sh", {
      path: "/custom",
      args: ["--verbose"],
      cwd: "/custom/cwd",
      supressStdout: true
    });

    expect(mockSpawnSync).toHaveBeenCalledWith(
      "/custom/run.sh",
      ["--verbose"],
      expect.objectContaining({
        cwd: "/custom/cwd",
        stdio: ["inherit", "pipe", "inherit"]
      })
    );

    expect(result).toBe("hidden output");
  });

  test("returns empty string if no stdout", () => {
    mockSpawnSync.mockReturnValue({});

    const result = executeScript("empty.sh");

    expect(result).toBe("");
  });
});

describe("clearConsole", () => {
  test("writes clear screen sequence to stdout", () => {
    const writeSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    clearConsole();
    expect(writeSpy).toHaveBeenCalledWith("\x1Bc");
    writeSpy.mockRestore();
  });
});

