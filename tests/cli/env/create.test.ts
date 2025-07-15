import yaml from "js-yaml";
import { readFileSync } from "node:fs";
import { beforeEach, describe } from "node:test";
import { afterEach, expect, it, vi } from "vitest";

import { clearMockConfig, mockConfig } from "@mocks/config";

import create from "@cli/env/create";
import { InvalidRepo } from "@files/repo";
import { InvalidSecretYaml } from "@files/secrets_yaml";
import { promptTmpFile } from "@interface/prompts";
import { Config, ConfigError } from "@lib/config";
import { input, search } from "@lib/ui";
import { isGitRepo } from "@lib/utils";

vi.mock("@interface/prompts", async () => ({
  ...await vi.importActual("@interface/prompts"),
  promptTmpFile: vi.fn()
}));

vi.mock("simple-git", () => ({
  default: vi.fn().mockReturnValue({
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
  })
}));

vi.mock("@lib/ui", async () => ({
  ...await vi.importActual("@lib/ui"),
  search: vi.fn(),
  input: vi.fn()
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockConfig();
});

afterEach(() => {
  clearMockConfig();
});

function mockConfigMapCreation() {
  vi.mocked(promptTmpFile).mockImplementation(async () => ({ changed: true, new_content: "env=key" }));
  vi.mocked(search).mockImplementation(async ({ choices }) => typeof choices[0] === "string" ? choices[0] : choices[0]?.name ?? "");
  vi.mocked(input).mockImplementationOnce(async () => "name");
}

function mockSecretCreation() {
  vi.mocked(promptTmpFile).mockImplementation(async () => ({ changed: true, new_content: "env=key" }));
  vi.mocked(search).mockImplementation(
    async ({ choices }) => {
      if (choices.includes("secret")) return "secret";
      return typeof choices[0] === "string" ? choices[0] : choices[0]?.name ?? "";
    }
  );
  vi.mocked(input).mockImplementationOnce(async () => "name");
  vi.mocked(readFileSync).mockReturnValue(yaml.dump({ externalSecret: { secret1: "secret1" } }));
}

describe("create command", () => {
  it("should create a configmap", async () => {
    mockConfigMapCreation();
    await create.handler();
  });

  it("should create a secret", async () => {
    mockSecretCreation();
    await create.handler();
  });

  it("should cancel if no changes are made", async () => {
    mockConfigMapCreation();
    vi.mocked(promptTmpFile).mockResolvedValue({ changed: false, new_content: "" });
    await create.handler();
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  it("should throw if no vault path is set", async () => {
    mockConfigMapCreation();
    mockConfig({ paths: { vault: undefined } });
    await expect(create.handler()).rejects.toThrow(new ConfigError("paths.vault"));
  });

  it("should throw if secrets yaml is invalid", async () => {
    mockSecretCreation();
    vi.mocked(readFileSync).mockReturnValue("");
    await expect(create.handler()).rejects.toThrow(InvalidSecretYaml);
  });

  it("should throw if vault path is not a git repository if creating a secret", async () => {
    mockSecretCreation();
    vi.mocked(isGitRepo).mockImplementation((p) => p.includes(Config.get().paths.vault as string) ? false : true);
    await expect(create.handler()).rejects.toThrow(InvalidRepo);
  });
});
