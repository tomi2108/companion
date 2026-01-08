import { jira } from "@jira/api";

import { Issue, IssueResponse } from "./issue";

export class Board {
  id: number;

  private jira: ReturnType<typeof jira>;

  constructor(id: number) {
    this.id = id;
    this.jira = jira();
  }

  getEpics() {
    // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/clair/-/issues/46]: Should only fetch Epic issues
    // maybe we need labels here ? but in movistar-empresas
    // parent issues ("Features") do not have labels, at least no the ones listed in theConfig.get()
    return this.getIssues({ type: "Feature" });
  }

  async getIssues({ labels, type, status }: { labels?: string[]; type?: string; status?: string[] }) {
    const query = [
      type && `issuetype=${type}`,
      labels && labels.length > 0 && `labels in (${labels.map((l) => `'${l}'`).join(",")})`,
      status && status.length > 0 && `!status in (${status.map((s) => `'${s}'`).join(",")})`
    ].filter(Boolean).join(" AND ");

    const res = await this.jira.getIssuesForBoard(
      String(this.id),
      0,
      100,
      query,
      true,
      ["key", "summary", "issuetype", "status"] as unknown as string // works
    );

    const issues = res.issues as IssueResponse[];
    return issues.map(Issue.fromIssueResponse);
  }

  async getCurrentSprint() {
    return (await this.jira.getAllSprints(String(this.id), 0, 1, "active")).values?.[0] ?? null;
  }
}
