import { beforeEach, describe } from "node:test";
import { expect, it, vi } from "vitest";

import { mockConfig } from "@mocks/config";

import create from "@cli/env/create";
import { promptTmpFile } from "@interface/prompts";
import { input, search } from "@lib/ui";

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
    branch: vi.fn(),
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

vi.mock("@lib/ui");

beforeEach(() => {
  vi.clearAllMocks();
  mockConfig();
});

describe("create command", () => {
  it("should create a configmap", async () => {
    vi.mocked(promptTmpFile).mockImplementation(async () => ({ changed: true, new_content: "env=key" }));
    vi.mocked(search).mockImplementation(async ({ choices }) => typeof choices[0] === "string" ? choices[0] : choices[0]?.name ?? "");
    vi.mocked(input).mockImplementationOnce(async () => "name");
    await create.handler();
  });

  it("should cancel if no changes are made", async () => {
    vi.mocked(promptTmpFile).mockResolvedValue({ changed: false, new_content: "" });
    vi.mocked(search).mockImplementation(async ({ choices }) => typeof choices[0] === "string" ? choices[0] : choices[0]?.name ?? "");
    vi.mocked(input).mockImplementationOnce(async () => "name");
    await create.handler();
    expect(process.exit).toHaveBeenCalledWith(0);
  });
  // it("should create a secret and update secrets.yaml", async () => {
  //   // Mock user inputs
  //   promptForOcResource.mockResolvedValue({ name: "project1" });
  //   search.mockResolvedValue("secret");
  //   input.mockResolvedValue("my-secret");
  //   promptTmpFile.mockResolvedValue({ changed: true, new_content: "key1=value1\nkey2=value2" });
  //   parseKeyVal.mockReturnValue({ key1: "value1", key2: "value2" });
  //   fs.readFileSync.mockReturnValue("externalSecret:\n  secret1: existing-secret");
  //
  //   // Call the handler
  //   await create.handler();
  //
  //   // Verify interactions
  //   expect(getOcToken).toHaveBeenCalled();
  //   expect(Openshift).toHaveBeenCalledWith(expect.any(String));
  //   expect(Openshift.prototype.createSecret).toHaveBeenCalledWith("my-secret", { key1: "value1", key2: "value2" });
  //
  //   const vaultPath = "/path/to/vault";
  //   const repoPath = path.join(vaultPath, "project1");
  //   const secretsFile = path.join(repoPath, "values.yaml");
  //   expect(fs.readFileSync).toHaveBeenCalledWith(secretsFile);
  //   expect(fs.writeFileSync).toHaveBeenCalledWith(secretsFile, expect.stringContaining("externalSecret:\n  secret0: existing-secret\n  secret1: my-secret"));
  //
  //   const mockGit = simpleGit.default();
  //   expect(mockGit.add).toHaveBeenCalledWith(secretsFile);
  //   expect(mockGit.commit).toHaveBeenCalledWith("my-secret");
  //   expect(mockGit.push).toHaveBeenCalledWith(["-u", "origin", "master"]);
  // });
  //
  // it("should not update secrets.yaml if secret already exists", async () => {
  //   // Mock user inputs
  //   promptForOcResource.mockResolvedValue({ name: "project1" });
  //   search.mockResolvedValue("secret");
  //   input.mockResolvedValue("my-secret");
  //   promptTmpFile.mockResolvedValue({ changed: true, new_content: "key1=value1\nkey2=value2" });
  //   parseKeyVal.mockReturnValue({ key1: "value1", key2: "value2" });
  //   fs.readFileSync.mockReturnValue("externalSecret:\n  secret1: my-secret");
  //
  //   // Call the handler
  //   await create.handler();
  //
  //   // Verify interactions
  //   expect(Openshift.prototype.createSecret).toHaveBeenCalledWith("my-secret", { key1: "value1", key2: "value2" });
  //   expect(fs.writeFileSync).not.toHaveBeenCalled();
  //   const mockGit = simpleGit.default();
  //   expect(mockGit.add).not.toHaveBeenCalled();
  //   expect(mockGit.commit).not.toHaveBeenCalled();
  //   expect(mockGit.push).not.toHaveBeenCalled();
  // });
  //
  // it("should throw an error if vault_path is not set", async () => {
  //   Config.get.mockReturnValue({ paths: { vault: undefined } });
  //
  //   await expect(create.handler()).rejects.toThrow("Vault path not set");
  // });
  //
});
