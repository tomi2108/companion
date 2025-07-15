import { beforeEach, describe } from "node:test";

import { mockConfig } from "@mocks/config";
import { it, vi } from "vitest";

vi.mock("@lib/ui", () => ({
  search: vi.fn().mockImplementation(({ choices }) => choices[0].name),
  input: vi.fn().mockReturnValue("name")
}));

vi.mock("@interface/prompts", () => ({
  ...vi.importActual("@interface/prompts"),
  promptTmpFile: vi.fn().mockReturnValue({ changed: true, new_content: "env=key" })
}));

vi.mock("simple-git", () => ({
  __esModule: true,
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

beforeEach(() => {
  vi.clearAllMocks();
  mockConfig({ paths: { vault: "/path/to/vault" } });
});

describe("create command", () => {

  it("should create a configmap", async () => {
    // await create.handler();

    // expect(getOcToken).toHaveBeenCalled();
    // expect(Openshift).toHaveBeenCalledWith(expect.any(String));
    // expect(Openshift.prototype.getProjects).toHaveBeenCalled();
    // expect(promptForOcResource).toHaveBeenCalledWith([{ name: "project1" }, { name: "project2" }]);
    // expect(search).toHaveBeenCalledWith({ message: "Choose type of resource to create", choices: ["configmap", "secret"] });
    // expect(input).toHaveBeenCalledWith({ message: "Enter a name for the new configmap" });
    // expect(promptTmpFile).toHaveBeenCalledWith("my-configmap-configmap", "KEY=VALUE");
    // expect(parseKeyVal).toHaveBeenCalledWith("key1=value1\nkey2=value2");
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
  // it("should cancel if no changes are made", async () => {
  //   search.mockResolvedValue("configmap");
  //   input.mockResolvedValue("my-configmap");
  //   promptTmpFile.mockResolvedValue({ changed: false, new_content: "" });
  //
  //   await create.handler();
  //
  //   expect(Openshift.prototype.createConfigMap).not.toHaveBeenCalled();
  //   expect(Openshift.prototype.createSecret).not.toHaveBeenCalled();
  // });
});
