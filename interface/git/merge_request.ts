import { Choice } from "@lib/constants";
import { loading } from "@lib/decorators/ui";
import { openInBrowser } from "@lib/editor";

import { MergeRequestProvider } from "./provider";

export class MergeRequest {
  id: number;
  iid: number;
  project_id: number;
  source_branch?: string;
  target_branch?: string;
  url?: string;
  title?: string;
  author?: string;
  merge_status?: string;

  provider: MergeRequestProvider;

  static descriptionFromCommits(commits: readonly { message: string }[]) {
    return commits.map((c) => `- ${c.message}`).join("\n\n");
  }

  constructor(
    project_id: number,
    id: number,
    iid: number,
    provider: MergeRequestProvider
  ) {
    this.id = id;
    this.project_id = project_id;
    this.iid = iid;
    this.provider = provider;
  }

  @loading("Merging merge request")
  async merge() {
    await this.provider.merge(this);
  }

  async close() {
    await this.provider.close(this);
  }

  async approve() {
    await this.provider.approve(this);
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
