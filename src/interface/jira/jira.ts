import axios, { AxiosInstance } from "axios";
import JiraCli from "jira-client";
import { Config } from "../../lib/config";
import { Issue, IssueResponse } from "./issue";

export const jira = () => new JiraCli({
  host: Config.get().jira.server,
  protocol: "https",
  username: Config.get().jira.username,
  password: Config.get().jira.token
});

export class Jira {
  private jira: JiraCli;
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
    const data = res.data as { displayName: string; emailAddress: string }[];
    return data.map((u) => ({ name: u.displayName, email: u.emailAddress }));
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
    return await this.jira.getProject(project_key);
  }

  async getBoard() {
    return await this.jira.getBoard(String(Config.get().jira.board_id));
  }

  async getIssues({ labels, type, status }: { labels?: string[]; type?: string; status?: string[] }) {
    const board = await this.getBoard();
    const query = [
      type && `issuetype=${type}`,
      labels && labels.length > 0 && `labels in (${labels.map((l) => `'${l}'`).join(",")})`,
      status && status.length > 0 && `!status in (${status.map((s) => `'${s}'`).join(",")})`
    ].filter(Boolean).join(" AND ");

    const res = await this.jira.getIssuesForBoard(
      board.id,
      0,
      100,
      query,
      true,
      ["key", "summary", "issuetype", "status"] as unknown as string // works
    );

    const issues = res.issues as IssueResponse[];
    return issues.map(Issue.fromIssueResponse);
  }
}

export const base64Encode = (string: string) => Buffer.from(string).toString("base64");
export const base64Decode = (string: string) => Buffer.from(string, "base64").toString();
