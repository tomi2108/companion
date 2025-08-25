import yaml from "js-yaml";
import { readFileSync } from "node:fs";
import { beforeEach, describe } from "node:test";
import { afterEach, expect, it, vi } from "vitest";

import { clearMockConfig, mockConfig } from "@mocks/config";
import { mockInput, mockSearch } from "@mocks/ui";

import create from "@cli/env/create";
import { InvalidRepo } from "@files/repo";
import { InvalidSecretYaml } from "@files/secrets_yaml";
import { promptTmpFile } from "@interface/prompts";
import { Config, ConfigError } from "@lib/config";
import { isGitRepo } from "@lib/utils";

vi.mock("@interface/prompts", async () => ({
  ...await vi.importActual("@interface/prompts"),
  promptTmpFile: vi.fn()
}));

vi.mock("@interface/git", async () => ({
  ...await vi.importActual("@interface/prompts"),
  promptTmpFile: vi.fn()
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  clearMockConfig();
});

function mockConfigMapCreation() {
  vi.mocked(promptTmpFile).mockResolvedValue({ changed: true, new_content: "env=key" });
  mockSearch(
    async ({ choices }) =>
      typeof choices[0] === "string" ? choices[0] : choices[0]?.name ?? ""
  );
  mockInput("name");
}

function mockSecretCreation() {
  vi.mocked(promptTmpFile).mockResolvedValue({ changed: true, new_content: "env=key" });
  mockSearch(
    async ({ choices }) => {
      if (choices.includes("secret")) return "secret";
      return typeof choices[0] === "string" ? choices[0] : choices[0]?.name ?? "";
    }
  );
  mockInput("name");
  vi.mocked(readFileSync).mockReturnValue(yaml.dump({ externalSecret: { secret1: "secret1" } }));
}

describe("CLI - env create command", () => {
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
