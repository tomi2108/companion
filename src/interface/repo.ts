import fs from "node:fs";
import path from "node:path";
import { ResetMode, SimpleGit } from "simple-git";
import { Config } from "../lib/config";
import { MS_TYPES } from "../lib/constants";
import { MergeRequest } from "./merge_request";
import { git, glab } from "./glab";

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

  async reset() {
    return await this.git.reset(ResetMode.HARD);
  }

  async createNewBranch(name: string) {
    const branches = await this.git.branchLocal();
    // TODO: revisit this
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
    await this.git.fetch(["-a"]);
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

  async push(branch: string) {
    return await this.git.push(["--set-upstream", "origin", branch]);
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

  async createMr(branch: string, projectId?: number) {
    await this.push(branch);

    const { id } = !projectId ? await this.getProject() : { id: projectId };

    const sourceBranch = await this.getActiveBranch();
    const commits = await this.getDiffCommits(sourceBranch, branch);
    const title = commits[0].message;
    const assigneeId = (await getCurrentUser()).id;
    const description = MergeRequest.descriptionFromCommits(commits);

    return MergeRequest.fromMergeRequestResponse(
      await this.glab.MergeRequests.create(id, sourceBranch, branch, title, {
        description,
        removeSourceBranch: true,
        assigneeId
      }));
  }

  async createAndMergeMr(branch: string) {
    const { id } = await this.getProject();
    const mr = await this.createMr(branch, id);
    setTimeout(async () => {
      // =) genius
      try {
        await mr.merge();
      } catch {
        await mr.merge();
      }
    }, 40 * 1000);
  }

  async getMrs() {
    const { id } = await this.getProject();
    return (await this.glab.MergeRequests.all({ projectId: id, state: "opened" }))
      .map(MergeRequest.fromMergeRequestResponse);
  }

  async getProject() {
    const { name, pathname } = await this.getInfo();
    // TODO: should probably find a better way
    // of getting gitlab info of a project based on
    // git workspace
    const matches = await this.glab.Projects.search(name);
    const project = matches.find((r) => pathname === r.path_with_namespace);
    if (!project?.id) throw new Error("Could not find project");
    return project;
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
    let type = Config.get().openshift.default_ms_type || MS_TYPES[0];
    MS_TYPES.forEach((t) => name?.includes(t) ? type = t : undefined);
    return { name, pathname, type };
  }

}

export class InvalidRepo extends Error {
  constructor(full_path: string) {
    super(`${full_path} is not a Git repository`);
  }
}
