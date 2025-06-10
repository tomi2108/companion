import fs from "node:fs";
import path from "node:path";
import { Gitlab } from "@gitbeaker/rest";
import { SimpleGit, simpleGit } from "simple-git";
import { Config } from "../lib/config";
import { MS_TYPES } from "../lib/constants";
import log from "../lib/log";

const glab = () => new Gitlab({
  token: Config.get().gitlab.token,
  host: Config.get().gitlab.server
});

const git = (full_path: string) => simpleGit({
  baseDir: full_path
});

// TODO: move somewhere
async function getCurrentUser() {
  return (await glab().Search.all("users", Config.get().gitlab.username))[0];
}

export class Repo {
  git: SimpleGit;
  glab: ReturnType<typeof glab>;
  full_path: string;

  static isGitRepo(full_path: string) {
    return full_path && fs.existsSync(path.join(full_path, ".git"));
  }

  static async cloneRepo(full_path: string, link: string) {
    await git(full_path).clone(link);
    const repo = new Repo(full_path);
    repo.update();
    return repo;
  }

  constructor(full_path: string) {
    if (Repo.isGitRepo(full_path)) {
      this.git = git(full_path);
      this.glab = glab();
      this.full_path = full_path;
    } else throw new InvalidRepo(full_path);
  }

  async getTags() {
    await this.git.fetch(["--tags"]);
    return (await this.git.tags({ "--sort": "-v:refname" })).all;
  }

  async stash(callback: () => Promise<void> | void) {
    const { total: stash_before } = await this.git.stashList();
    await this.git.stash(["--include-untracked"]);
    const { total: stash_after } = await this.git.stashList();
    await callback();
    if (stash_after !== stash_before) await this.git.stash(["pop"]);
  }

  async createNewBranch(name: string) {
    const branches = await this.git.branchLocal();
    if (branches.all.includes(name)) await this.git.deleteLocalBranch(name, true);
    await this.git.checkoutLocalBranch(name);
  }

  async add(file: string) {
    await this.git.add(file);
  }

  async commit(message: string) {
    await this.git.commit(message);
  }

  async checkout(branch: string) {
    await this.git.checkout(branch);
  }

  async switchBranchIfExists(branch: string) {
    const branches = await this.git.branchLocal();
    if (!branches.all.includes(branch)) return { switched: false };
    await this.git.checkout(branch);
    return { switched: true };
  }

  async pull() {
    await this.git.pull();
  }

  async push() {
    return await this.git.push("origin");
  }

  async getConfig(key: string) {
    const value = (await this.git.getConfig(key)).value;
    if (!value) throw new Error(`Could not get ${value} for repo ${value}`);
    return value;
  }

  // async setConfig(key: string, value: unknown) {
  // TODO: check
  //   await this.git.setConfig(key, value);
  // }

  async getOriginUrl() {
    return this.getConfig("remote.origin.url");
  }

  async getActiveBranch() {
    return (await this.git.branchLocal()).current;
  }

  async getBranches() {
    return (await this.git.branchLocal()).all;
  }

  async getCommits() {
    return (await this.git.log()).all;
  }

  async getDiffCommits(sourceBranch: string, targetBranch: string) {
    return (await this.git.log({ from: sourceBranch, to: targetBranch })).all;
  }

  private getMrDescriptionFromCommits(commits: readonly { message: string }[]) {
    // TODO: test
    return commits.map((c) => `- ${c.message}`).join("\n\n");
  }

  async createMr(branch: string) {
    await this.push();
    const project = await this.getProject();
    const sourceBranch = await this.getActiveBranch();
    const commits = await this.getDiffCommits(sourceBranch, branch);
    const title = commits[0].message;
    const assigneeId = (await getCurrentUser()).id;
    const description = this.getMrDescriptionFromCommits(commits);
    const projectId = project?.id;
    if (!projectId) return log.error("Could not find project");

    return await this.glab.MergeRequests.create(projectId, sourceBranch, branch, title, {
      description,
      removeSourceBranch: true,
      assigneeId
    });
  }

  async createAndMergeMr(branch: string) {
    this.createMr(branch);
    setTimeout(() => {
      // TODO: merge, probably with one retry just in case
    }, 40 * 1000);
  }

  async getProject() {
    const { name, pathname } = await this.getInfo();
    // TODO: should probably find a better way
    // of getting gitlab info of a project based on
    // git workspace
    const matches = await this.glab.Projects.search(name);
    return matches.find((r) => pathname === r.path_with_namespace);
  }

  async update() {
    await this.stash(async () => {
      // hmm...
      const { switched: switchedM } = await this.switchBranchIfExists("master");
      if (switchedM) await this.pull();
      const { switched: switchedR } = await this.switchBranchIfExists("release");
      if (switchedR) await this.pull();
      const { switched: switchedD } = await this.switchBranchIfExists("develop");
      if (switchedD) await this.pull();
    });
  }

  async getInfo() {
    const origin_url = await this.getOriginUrl();
    const url = new URL(origin_url);
    const pathname = url.pathname.slice(0, -4).slice(1);
    const name = pathname.split("/").at(-1) ?? "";
    const type = MS_TYPES
      .reduce((_, curr) => name?.includes(curr) ? curr : "" as "fcd")
      || Config.get().openshift.default_ms_type
      || MS_TYPES[0];
    return { name, pathname, type };
  }

}

export class InvalidRepo extends Error {
  constructor(full_path: string) {
    super(`${full_path} is not a Git repository`);
  }
}
