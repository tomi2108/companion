import { Choice } from "../lib/constants";
import { executeScript } from "./cmd";
import { jira } from "./jira";

export type IssueResponse = {
  id: string;
  key: string;
  fields: {
    issuetype: { name: string };
    status: { name: string };
    summary: string;
  };
};

export class Issue {
  key: string;
  id: string;
  type?: string;
  status?: string;
  description?: string;

  private jira;

  static formatLabels(labels: string[]) {
    return labels.map((l) => `-l${l}`);
  }

  static fromIssueResponse(i: IssueResponse) {
    const issue = new Issue(i.key, i.id);
    issue.type = i.fields.issuetype.name;
    issue.status = i.fields.status.name;
    issue.description = i.fields.summary;
    return issue;
  }

  constructor(key: string, id: string) {
    this.key = key;
    this.id = id;
    this.jira = jira();
  }

  async edit() {
    return await this.jira.updateIssue(this.id, {
      // TODO: fields
    });
  }

  async delete() {
    return await this.jira.deleteIssue(this.id);
  }

  async comment(comment: string) {
    return await this.jira.addComment(this.id, comment);
  }

  async getComments() {
    return (await this.jira.getComments(this.id)).comments;
  }

  async getAvailableTransitions() {
    return (await this.jira.listTransitions(this.id)).transitions;
  }

  async transition(transitionId: string) {
    return await this.jira.transitionIssue(this.id, { id: transitionId });
  }

  view() {
    return executeScript("jira/view", {
      args: [this.key]
    });
  }

  openInBrowser() {
    return executeScript("jira/open", {
      args: [this.key]
    });
  }

  link(issue: Issue) {
    return executeScript("jira/link", {
      args: [this.key, issue.key]
    });
  }

  unlink(issue: Issue) {
    return executeScript("jira/unlink", {
      args: [this.key, issue.key]
    });
  }

  createChild(labels?: string[]) {
    return executeScript("jira/create", {
      args: [this.key, ...Issue.formatLabels(labels ?? [])]
    });
  }

  assign(user: string) {
    return executeScript("jira/assign", {
      args: [this.key, user]
    });
  }

  estimate(estimacion: string) {
    return executeScript("jira/estimate", {
      args: [this.key, estimacion]
    });
  }

  toChoice(): Choice {
    return { name: this.key, hint: `[${this.type}] (${this.status}) ${this.description}` };
  }
}
