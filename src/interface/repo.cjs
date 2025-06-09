const { Gitlab } = require("@gitbeaker/rest");
const fs = require("node:fs");
const path = require("node:path");
const gitCreate = require("simple-git");
const config = require("../lib/config.cjs");
const { getCurrentUser } = require("./glab.cjs");

const glab = () => new Gitlab({
  token: config.gitlab.token,
  host: config.gitlab.server
});

const git = (full_path) => gitCreate({
  baseDir: full_path
});

class InvalidRepo extends Error {
  constructor(full_path) {
    super(`${full_path} is not a Git repository`);
  }
}

function getMrDescriptionFromCommits(commits) {
  // TODO: not working :p
  return commits.map((c) => `• ${c.message}`).join("\n");
}

class Repo {

  static isGitRepo(full_path) {
    return full_path && fs.existsSync(path.join(full_path, ".git"));
  }

  static async cloneRepo(full_path, link) {
    await git(full_path).clone(link);
    const repo = new Repo(full_path);
    repo.update();
    return repo;
  }

  constructor(full_path) {
    if (Repo.isGitRepo(full_path)) {
      this.git = git(full_path);
      this.glab = glab();
    } else throw new InvalidRepo(full_path);
  }

  async getTags() {
    await this.git.fetch(["--tags"]);
    return (await this.git.tags({ "--sort": "-v:refname" })).all;
  }

  async stash(callback) {
    const { total: stash_before } = await this.git.stashList();
    await this.git.stash(["--include-untracked"]);
    const { total: stash_after } = await this.git.stashList();
    await callback();
    if (stash_after !== stash_before) await this.git.stash(["pop"]);
  }

  async createNewBranch(name) {
    try {
      await this.git.deleteLocalBranch(name, true);
    } catch { }
    await this.git.checkoutLocalBranch(name);
  }

  async add(file) {
    await this.git.add(file);
  }

  async commit(message) {
    await this.git.commit(message);
  }

  async switchAndCreateBranch(branch) {
    await this.git.checkout(branch);
  }

  async switchBranchIfExists(branch) {
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

  async getConfig(key) {
    return (await this.git.getConfig(key)).value;
  }

  async setConfig(key, value) {
    await this.git.setConfig(key, value);
  }

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

  async getDiffCommits(sourceBranch, targetBranch) {
    return (await this.git.log({ from: sourceBranch, to: targetBranch })).all;
  }

  async createMr(branch) {
    await this.push();
    const project = await this.getProject();
    const sourceBranch = await this.getActiveBranch();
    const commits = await this.getDiffCommits(sourceBranch, branch);
    const title = commits[0].message;
    const assigneeId = (await getCurrentUser()).id;
    const description = getMrDescriptionFromCommits(commits);

    return await this.glab.MergeRequests.create(project.id, sourceBranch, branch, title, {
      description,
      removeSourceBranch: true,
      assigneeId
    });
  }

  async createAndMergeMr(branch) {
    const mr = this.createMr(branch);
    setTimeout(() => {
      // TODO: merge, probably with one retry just in case
    }, 40 * 1000);
  }

  async getProject() {
    const origin_url = await this.getOriginUrl();
    const url = new URL(origin_url);
    const pathname = url.pathname.slice(0, -4).slice(1);
    const name = pathname.split("/").at(-1);
    // TODO: should probably find a better way
    // of getting gitlab info of a project based on
    // git workspace
    const matches = await this.glab.Projects.search(name);
    return matches.find((r) => pathname === r.path_with_namespace);
  }

  async update() {
    await this.stash(async () => {
      // hmm...
      const { switchedM } = await this.switchBranchIfExists("master");
      if (switchedM) await this.pull();
      const { switchedR } = await this.switchBranchIfExists("release");
      if (switchedR) await this.pull();
      const { switchedD } = await this.switchBranchIfExists("develop");
      if (switchedD) await this.pull();
    });
  }
}

module.exports = { Repo, InvalidRepo };
