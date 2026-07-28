import { ResetMode, SimpleGit } from "simple-git";

import { File } from "@files/file";
import { Dir } from "@interface/dirs/dir";
import { git } from "@interface/git";
import { CommitEvent } from "@lib/actions/events";
import { ActionRegistry } from "@lib/actions/registry";
import { Config } from "@lib/config";
import { APP_TYPES, Choice } from "@lib/constants";
import { loading } from "@lib/decorators/ui";
import { isGitRepo } from "@lib/utils";

export class Repo {
  git: SimpleGit;
  dir: Dir;

  static async cloneRepo(dir: Dir, link: string, current?: boolean) {
    dir.create();
    const gitInstance = git(dir);
    if (current) await gitInstance.clone(link, ".");
    else await gitInstance.clone(link);

    const url = new URL(link);
    const pathname = url.pathname.slice(0, -4).slice(1);
    const name = pathname.split("/").at(-1) ?? "";

    const repo = new Repo(current ? dir : dir.sub(name));
    return repo;
  }

  constructor(dir: Dir) {
    if (!isGitRepo(dir)) throw new InvalidRepo(dir);
    this.git = git(dir);
    this.dir = dir;
  }

  static async init(dir: Dir, initialBranch: string) {
    await git(dir).init(["--initial-branch", initialBranch]);
    return new Repo(dir);
  }

  async getTags(opts?: { sortByLastCreated: boolean }) {
    const sort = opts?.sortByLastCreated ? "-creatordate" : "-v:refname";
    await this.git.fetch(["--tags"]);
    return (await this.git.tags({ "--sort": sort })).all;
  }

  async stash<T>(callback: () => Promise<T> | T) {
    const hasCommits = (await this.getCommits()).length !== 0;
    if (!hasCommits) return await callback();

    const { total: stash_before } = await this.git.stashList();
    await this.git.stash(["--include-untracked"]);
    const { total: stash_after } = await this.git.stashList();
    const res = await callback();
    if (stash_after !== stash_before) await this.git.stash(["pop"]);
    return res;
  }

  async reset() {
    return await this.git.reset(ResetMode.HARD);
  }

  async deleteBranch(name: string) {
    return await this.git.deleteLocalBranch(name, true);
  }

  async createNewBranch(name: string) {
    const branches = await this.git.branchLocal();
    if (branches.all.includes(name)) this.deleteBranch(name);
    return await this.git.checkoutLocalBranch(name);
  }

  async addAll() {
    return await this.git.add(".");
  }

  @loading("Adding file:", (file: File<unknown>) => file.toString())
  async add(file: File<unknown>) {
    await this.git.add(file.path);
  }

  @loading("Commiting with message:", (message) => message)
  async commit(message: string) {
    try {
      const c = await this.git.commit(message);
      if (!c.commit) return null;
      ActionRegistry.dispatch(new CommitEvent(this));
      return c;
    } catch {
      return null;
    }
  }

  async checkout(branch: string) {
    await this.git.fetch(["-a"]);
    await this.git.checkout(branch);
  }

  async switchBranchIfExists(branch: string) {
    const active_branch = await this.getActiveBranch();
    const branches = await this.git.branchLocal();
    if (!branches.all.includes(branch) || active_branch === branch) return { switched: false, original_branch: active_branch };
    await this.git.checkout(branch);

    return { switched: true, original_branch: active_branch };
  }

  async pull(branch: string) {
    await this.git.branch(["-u", `origin/${branch}`, branch]);
    return await this.git.pull("origin", branch, ["--no-rebase"]);
  }

  async push(branch: string) {
    return await this.git.push(["-u", "origin", branch]);
  }

  async getConfig(key: string) {
    const value = (await this.git.getConfig(key)).value;
    if (!value) throw new Error(`Could not get ${key} for repo ${this.dir}`);
    return value;
  }

  async addOrigin(remoteRepo: string) {
    return await this.git.addRemote("origin", remoteRepo);
  }

  async getOriginUrl() {
    return await this.getConfig("remote.origin.url");
  }

  async getActiveBranch() {
    return (await this.git.branchLocal()).current;
  }

  async getBranches() {
    return (await this.git.branchLocal()).all;
  }

  async getCommits() {
    try {
      return (await this.git.log()).all;
    } catch (err) {
      return [];
    }
  }

  async getDiffCommits(sourceBranch: string, targetBranch: string) {
    return (await this.git.log({ from: sourceBranch, to: targetBranch })).all;
  }

  async getCurrentBranch() {
    return (await this.git.branch()).current;
  }

  async update() {
    const initial_branch = await this.getCurrentBranch();
    await this.stash(async () => {
      await this.git.fetch(["--all", "--prune"]);
      const remotes = (await this.git.branch(["-r"])).all;
      for (const r of remotes) {
        const local = r.slice("origin/".length);
        await this.git.branch(["--track", local, r]).catch(() => { });
        await this.switchBranchIfExists(local);
        await this.pull(local);
      }
      await this.switchBranchIfExists(initial_branch);
    });
  }

  async getInfo() {
    const origin_url = await this.getOriginUrl();
    const url = new URL(origin_url);
    const pathname = url.pathname.slice(0, -4).slice(1);
    const name = pathname.split("/").at(-1) ?? "";
    let type = Config.getView().get("openshift.default_ms_type") || APP_TYPES[0];
    // TODO(20260318-002418): Not the best idea, find a better way
    APP_TYPES.forEach((t) => name?.includes(t) ? type = t : undefined);
    return { name, pathname, type };
  }

  toString() {
    return this.dir.toString();
  }

  toChoice(): Choice {
    return this.dir.toChoice();
  }
}

export class InvalidRepo extends Error {
  constructor(dir: Dir) {
    super(`${dir} is not a Git repository`);
  }
}
