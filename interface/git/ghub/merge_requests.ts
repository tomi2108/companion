import { Octokit } from "octokit";

import { MergeRequest } from "../merge_request";
import { GitProject } from "../project";
import { MergeRequestProvider } from "../provider";
import { getOwnerRepoById, getOwnerRepoByUrl, ghub } from "./api";

export class GithubMergeRequestProvider implements MergeRequestProvider {
  private ghub: Octokit;
  constructor() {
    this.ghub = ghub();
  }

  async getMergeRequests(project: GitProject) {
    const { owner, repo } = getOwnerRepoById(project.name);
    const res = await this.ghub.rest.pulls.list({ owner, repo, state: "open" });
    return Promise.all(
      res.data.map(async (pr) => {
        const { data } = await this.ghub.rest.pulls.get({ owner, repo, pull_number: pr.number });
        const mr = new MergeRequest(project.id, pr.id, pr.number, this);
        mr.source_branch = pr.head.ref;
        mr.target_branch = pr.base.ref;
        mr.url = pr.html_url;
        mr.title = pr.title;
        mr.author = pr.user?.login;
        mr.merge_status = data.mergeable && data.mergeable_state === "clean"
          ? "can_be_merged"
          : "cannot_be_merged";
        return mr;
      })
    );
  }

  async create(project: GitProject, opts: {
    sourceBranch: string;
    targetBranch: string;
    title: string;
    description?: string;
  }) {
    const { owner, repo } = getOwnerRepoById(project.name);
    const res = await this.ghub.rest.pulls.create({
      owner, repo,
      title: opts.title,
      head: opts.sourceBranch,
      base: opts.targetBranch,
      body: opts.description
    });
    const pr = res.data;
    const mr = new MergeRequest(project.id, pr.id, pr.number, this);
    mr.source_branch = pr.head.ref;
    mr.target_branch = pr.base.ref;
    mr.url = pr.html_url;
    mr.title = pr.title;
    mr.author = pr.user ? pr.user.login : undefined;
    mr.merge_status = pr.mergeable ? "can_be_merged" : "cannot_be_merged";
    return mr;
  }

  async merge(mr: MergeRequest) {
    const { owner, repo } = getOwnerRepoByUrl(mr.url || "");
    await this.ghub.rest.pulls.merge({
      owner,
      repo,
      pull_number: mr.iid
    });
  }

  async close(mr: MergeRequest) {
    const { owner, repo } = getOwnerRepoByUrl(mr.url || "");
    await this.ghub.rest.pulls.update({
      owner,
      repo,
      pull_number: mr.iid,
      state: "closed"
    });
  }

  async approve(mr: MergeRequest) {
    const { owner, repo } = getOwnerRepoByUrl(mr.url || "");
    await this.ghub.rest.pulls.createReview({
      owner,
      repo,
      pull_number: mr.iid,
      event: "APPROVE"
    });
  }
}
