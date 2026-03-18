import { MergeRequestSchema } from "@gitbeaker/rest";

import { MergeRequest } from "../merge_request";
import { MergeRequestProvider } from "../provider";
import { GitlabCredentials, glab } from "./api";
import { GitProject } from "../project";
import { GitlabUserProvider } from "./users";

type MergeRequestResponse = MergeRequestSchema;

export class GitlabMergeRequestProvider implements MergeRequestProvider {
  glab: ReturnType<typeof glab>;
  userProvider: GitlabUserProvider;

  constructor(credentials: GitlabCredentials) {
    this.glab = glab(credentials);
    this.userProvider = new GitlabUserProvider(credentials);
  }

  private fromMergeRequestResponse(mr: MergeRequestResponse) {
    const merge_request: MergeRequest = new MergeRequest(
      mr.project_id,
      mr.id,
      mr.iid,
      this
    );
    merge_request.source_branch = mr.source_branch;
    merge_request.target_branch = mr.target_branch;
    merge_request.title = mr.title;
    merge_request.merge_status = mr.merge_status;
    merge_request.url = mr.web_url;
    merge_request.author = mr.author.name;
    return merge_request;
  }

  async create(
    project: GitProject,
    opts: { sourceBranch: string; targetBranch: string; title: string; description?: string }
  ) {
    const { sourceBranch, title, targetBranch, description } = opts;
    const me = await this.userProvider.me();
    const assigneeId = me.id;
    const mr = await this.glab.MergeRequests.create(
      project.id,
      sourceBranch,
      targetBranch,
      title,
      { removeSourceBranch: true, description, assigneeId }
    );
    return this.fromMergeRequestResponse(mr);
  }

  async getMergeRequests(project: GitProject) {
    const id = project.id;
    return (await this.glab.MergeRequests.all({ projectId: id, state: "opened" }))
      .map(this.fromMergeRequestResponse);
  }

  async merge(mr: MergeRequest) {
    await this.glab.MergeRequests.merge(
      mr.project_id,
      mr.iid,
      { shouldRemoveSourceBranch: true }
    );
  }

  async close(mr: MergeRequest) {
    await this.glab.MergeRequests.remove(mr.project_id, mr.iid);
  }

  async approve(mr: MergeRequest) {
    await this.glab.MergeRequests.accept(mr.project_id, mr.iid);
  }
}

