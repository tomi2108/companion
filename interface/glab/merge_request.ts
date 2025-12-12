import { MergeRequestSchema } from "@gitbeaker/rest";

import { glab } from "@glab/api";
import { openInBrowser } from "@lib/config";
import { Choice } from "@lib/constants";
import { loading } from "@lib/ui";

export type MergeRequestResponse = MergeRequestSchema;

export class MergeRequest {
  id: number;
  iid: number;
  project_id: number;
  source_branch?: string;
  target_branch?: string;
  url?: string;
  title?: string;
  author?: string;
  merge_status?: "unchecked" | "checking" | "can_be_merged" | "cannot_be_merged" | "cannot_be_merged_recheck";

  glab: ReturnType<typeof glab>;

  static fromMergeRequestResponse(mr: MergeRequestResponse) {
    const merge_request = new MergeRequest(mr.project_id, mr.id, mr.iid);
    merge_request.source_branch = mr.source_branch;
    merge_request.target_branch = mr.target_branch;
    merge_request.title = mr.title;
    merge_request.merge_status = mr.merge_status;
    merge_request.url = mr.web_url;
    merge_request.author = mr.author.name;
    return merge_request;
  }

  static descriptionFromCommits(commits: readonly { message: string }[]) {
    return commits.map((c) => `- ${c.message}`).join("\n\n");
  }

  constructor(project_id: number, id: number, iid: number) {
    this.id = id;
    this.project_id = project_id;
    this.iid = iid;
    this.glab = glab();
  }

  async merge() {
    const spinner = loading("Merging merge request");
    try {
      const mr = await this.glab.MergeRequests.merge(this.project_id, this.iid, { shouldRemoveSourceBranch: true });
      spinner.succeed();
      return mr;
    } catch (err) {
      spinner.fail();
      throw err;
    }
  }

  async close() {
    // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/companion/-/issues/62]: test
    return await this.glab.MergeRequests.remove(this.project_id, this.iid);
  }

  async approve() {
    // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/companion/-/issues/55]: fix this
    return await this.glab.MergeRequests.accept(this.project_id, this.iid);
  }

  openInBrowser() {
    if (!this.url) throw new Error("Missing merge request url");
    openInBrowser(this.url);
  }

  toChoice(): Choice {
    let hint = "";
    hint += `${this.source_branch} -> ${this.target_branch} `;
    hint += this.merge_status === "can_be_merged" ? "(Can be merged)" : "(! Cannot be merged)";
    hint += ` [${this.author}]`;

    return {
      name: this.title ?? "",
      value: this.id,
      hint: hint.trim()
    };
  }
}
