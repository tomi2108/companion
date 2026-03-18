import { MergeRequest } from "@interface/git/merge_request";
import { GitProvider } from "@interface/git/provider";
import { MrCreateEvent } from "@lib/actions/events";
import { ActionRegistry } from "@lib/actions/registry";
import { loading } from "@lib/decorators/ui";
import { sleep } from "@lib/utils";

import { Repo } from "./repo";

export class RepoWithGitProvider extends Repo {
  provider: GitProvider;
  repo: Repo;

  constructor(repo: Repo, provider: GitProvider) {
    super(repo.dir);
    this.repo = repo;
    this.provider = provider;
  }

  async createAndMergeMr(targetBranch: string) {
    const mr = await this.createMr(targetBranch);
    await sleep(45 * 1000);
    // genius =)
    try {
      await mr.merge();
    } catch {
      await sleep(20 * 1000);
      await mr.merge();
    }
  }

  @loading("Creating merge request")
  async createMr(
    targetBranch: string,
    opts?: { title?: string }
  ) {
    await ActionRegistry.dispatch(new MrCreateEvent(this));
    const sourceBranch = await this.getActiveBranch();
    await this.push(sourceBranch);

    const commits = await this.getDiffCommits(sourceBranch, targetBranch);
    const title = opts?.title || commits?.[0]?.message || `Merge '${sourceBranch}' into ${targetBranch}`;
    const description = MergeRequest.descriptionFromCommits(commits);

    // TODO(20260318-002459): implement
    // const assigneeId = await new GitlabUser(Config.get().gitlab.username).getId();
    // const reviewerIds: number[] = [];
    // if (opts?.reviewer) {
    //   const reviewerId = await new GitlabUser(opts.reviewer).getId();
    //   if (reviewerId !== undefined) reviewerIds.push(reviewerId);
    // }
    const project = await this.getProject();
    return await this.provider.mergeRequests.create(project, {
      sourceBranch,
      targetBranch,
      title,
      description
    });
  }

  async getMrs() {
    const project = await this.getProject();
    return await this.provider.mergeRequests.getMergeRequests(project);
  }

  async createIssue({ title, description }: {
    title: string;
    description: string;
  }) {
    const project = await this.getProject();
    return await this.provider.issues.createIssue(project, { title, description });
  }

  async getProject() {
    const { name, pathname } = await this.getInfo();
    return this.provider.projects.search(name, pathname);
  }

  async getLatestRelease() {
    const project = await this.getProject();
    return this.provider.projects.getLatestRelease(project);
  }

}