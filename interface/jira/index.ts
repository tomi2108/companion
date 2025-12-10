import axios, { AxiosInstance } from "axios";

import { base64Encode } from "@files/utils";
import { jira } from "@jira/api";
import { Issue, IssueResponse } from "@jira/issue";
import { Config } from "@lib/config";

import { JiraProject, JiraProjectReponse } from "./project";
import { JiraUser, JiraUserResponse } from "./user";

export class Jira {
  // TODO: try to stick to one
  private jira: ReturnType<typeof jira>;
  private api: AxiosInstance;

  constructor() {
    this.jira = jira();
    const string = `${Config.get().jira.username}:${Config.get().jira.token}`;
    const encodedString = base64Encode(string);
    this.api = axios.create({
      baseURL: `https://${Config.get().jira.server}/rest/api`,
      headers: { Authorization: `Basic ${encodedString}` }
    });
  }

  async getUsers() {
    const params = { project: Config.get().jira.project_key, maxResults: 1000 };
    const res = await this.api.get("/3/user/assignable/search", { params });
    // TODO: test
    const data = res.data as JiraUserResponse[];
    return data.map((u) => JiraUser.fromUserResponse(u));
  }

  async getCurrentUser() {
    return JiraUser.fromUserResponse(
      await this.jira.getCurrentUser() as JiraUserResponse
    );
  }

  getEpics() {
    // TODO: Should only fetch Epic issues
    // maybe we need labels here ? but in movistar-empresas
    // parent issues ("Features") do not have labels, at least no the ones listed in theConfig.get()
    return this.getIssues({ type: "Feature" });
  }

  async getProject() {
    const project_key = Config.get().jira.project_key;
    if (!project_key) throw new Error("Missing jira project_key");
    return JiraProject.fromJiraProjectResponse(await this.jira.getProject(project_key) as JiraProjectReponse);
  }

  async getBoard() {
    return await this.jira.getBoard(String(Config.get().jira.board_id));
  }

  async getIssue(idOrKey: string) {
    return Issue.fromIssueResponse(await this.jira.getIssue(idOrKey) as IssueResponse);
  }

  async getIssues({ labels, type, status }: { labels?: string[]; type?: string; status?: string[] }) {
    const board_id = String(Config.get().jira.board_id);
    const query = [
      type && `issuetype=${type}`,
      labels && labels.length > 0 && `labels in (${labels.map((l) => `'${l}'`).join(",")})`,
      status && status.length > 0 && `!status in (${status.map((s) => `'${s}'`).join(",")})`
    ].filter(Boolean).join(" AND ");

    const res = await this.jira.getIssuesForBoard(
      board_id,
      0,
      100,
      query,
      true,
      ["key", "summary", "issuetype", "status"] as unknown as string // works
    );

    const issues = res.issues as IssueResponse[];
    return issues.map(Issue.fromIssueResponse);
  }

  async getIssueLinkTypes() {
    return (await this.jira.listIssueLinkTypes()).issueLinkTypes as { name: string; inward: string }[];
  }

  async getIssueTypes() {
    return await this.jira.listIssueTypes();
  }
}
