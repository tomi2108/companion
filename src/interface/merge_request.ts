import { Gitlab, MergeRequestSchema } from "@gitbeaker/rest";
import { Config } from "../lib/config";
import { openInBrowser } from "../lib/utils";

export type MergeRequestResponse = MergeRequestSchema;

const glab = () => new Gitlab({
  token: Config.get().gitlab.token,
  host: Config.get().gitlab.server
});

export class MergeRequest {
  id: number;
  project_id: number;
  source_branch?: string;
  target_branch?: string;
  url?: string;
  title?: string;
  merge_status?: "unchecked" | "checking" | "can_be_merged" | "cannot_be_merged" | "cannot_be_merged_recheck";
  glab: ReturnType<typeof glab>;

  static fromMergeRequestResponse(mr: MergeRequestResponse) {
    const merge_request = new MergeRequest(mr.project_id, mr.id);
    merge_request.source_branch = mr.source_branch;
    merge_request.target_branch = mr.target_branch;
    merge_request.title = mr.title;
    merge_request.merge_status = mr.merge_status;
    merge_request.url = mr.web_url;
    return merge_request;
  }

  static descriptionFromCommits(commits: readonly { message: string }[]) {
    // TODO: test
    return commits.map((c) => `- ${c.message}`).join("\n\n");
  }

  constructor(project_id: number, id: number) {
    this.id = id;
    this.project_id = project_id;
    this.glab = glab();
  }

  async merge() {
    return await this.glab.MergeRequests.merge(this.project_id, this.id);
  }

  openInBrowser() {
    if (!this.url) throw new Error("Missing merge request url");
    openInBrowser(this.url);
  }

  toChoice() {
    let hint = "";
    hint += `${this.source_branch} -> ${this.target_branch} `;
    hint += this.merge_status === "can_be_merged" ? "(Can be merged)" : "(! Cannot be merged)";

    return {
      name: this.title ?? "",
      value: this.id,
      hint: hint.trim()
    };
  }
}
