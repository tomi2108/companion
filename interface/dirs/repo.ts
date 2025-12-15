import { setTimeout } from "node:timers/promises";
import { ResetMode, SimpleGit } from "simple-git";

import { Dir } from "@files/dir";
import { File } from "@files/file";
import { git, glab } from "@glab/api";
import { MergeRequest } from "@glab/merge_request";
import { GitlabUser } from "@glab/user";
import { Config } from "@lib/config";
import { APP_TYPES } from "@lib/constants";
import { loading } from "@lib/ui";
import { isGitRepo } from "@lib/utils";

import { RepoAction } from "./actions";

export class Repo {
  git: SimpleGit;
  glab: ReturnType<typeof glab>;
  dir: Dir;
  actions: RepoAction[] = [];

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
    this.glab = glab();
    this.dir = dir;
  }

  async init(initialBranch: string) {
    return await this.git.init(["--initial-branch", initialBranch]);
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

  async add(file: File<unknown>) {
    const spinner = loading(`Adding file: ${file}`);
    await this.git.add(file.path);
    spinner.succeed();
  }

  async commit(message: string) {
    const spinner = loading(`Commiting with message: ${message}`);
    const c = await this.git.commit(message);
    if (!c.commit) {
      spinner.fail();
      return null;
    }
    spinner.succeed();
    return c;
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
    if (!value) throw new Error(`Could not get ${value} for repo ${value}`);
    return value;
  }

  async addOrigin(remoteRepo: string) {
    this.git.addRemote("origin", remoteRepo);
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

  private async runActions() {
    for (const action of this.actions) await action.onMrCreate(this);
  }

  async createMr(targetBranch: string, opts?: { projectId?: number; title?: string; reviewer?: string }) {
    await this.runActions();
    const sourceBranch = await this.getActiveBranch();
    await this.push(sourceBranch);

    const { id } = !opts?.projectId ? await this.getProject() : { id: opts.projectId };

    const commits = await this.getDiffCommits(sourceBranch, targetBranch);
    const title = opts?.title || commits?.[0]?.message || `Merge '${sourceBranch}' into ${targetBranch}`;
    const assigneeId = await new GitlabUser(Config.get().gitlab.username).getId();
    const description = MergeRequest.descriptionFromCommits(commits);

    const reviewerIds: number[] = [];
    if (opts?.reviewer) {
      const reviewerId = await new GitlabUser(opts.reviewer).getId();
      if (reviewerId !== undefined) reviewerIds.push(reviewerId);
    }

    return MergeRequest.fromMergeRequestResponse(
      await this.glab.MergeRequests.create(id, sourceBranch, targetBranch, title, {
        description,
        reviewerIds,
        removeSourceBranch: true,
        assigneeId
      }));
  }

  async createAndMergeMr(targetBranch: string) {
    const spinner = loading("Building merge request");
    const { id } = await this.getProject();
    const mr = await this.createMr(targetBranch, { projectId: id });
    await setTimeout(45 * 1000);
    spinner.succeed();
    // genius =)
    try {
      await mr.merge();
    } catch {
      setTimeout(20 * 1000);
      await mr.merge();
    }
  }

  async getMrs() {
    const { id } = await this.getProject();
    return (await this.glab.MergeRequests.all({ projectId: id, state: "opened" }))
      .map(MergeRequest.fromMergeRequestResponse);
  }

  async createIssue({ title, description }: {
    title: string;
    description: string;
  }) {
    const project = await this.getProject();
    const assigneeId = await new GitlabUser(Config.get().gitlab.username).getId();
    const options = { description, assigneeId };
    return await this.glab.Issues.create(project.id, title, options);
  }

  async getProject() {
    const { name, pathname } = await this.getInfo();
    const matches = await this.glab.Projects.search(name);
    const project = matches.find((r) => pathname === r.path_with_namespace);
    if (!project?.id) throw new Error("Could not find project");
    return project;
  }

  async getLatestRelease() {
    const project = await this.getProject();
    const releases = await this.glab.ProjectReleases.showLatest(project.id);
    return releases;
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
    let type = Config.get().openshift.default_ms_type || APP_TYPES[0];
    // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/companion/-/issues/56]: Not the best idea, find a better way
    APP_TYPES.forEach((t) => name?.includes(t) ? type = t : undefined);
    return { name, pathname, type };
  }

}

export class InvalidRepo extends Error {
  constructor(dir: Dir) {
    super(`${dir} is not a Git repository`);
  }
}
