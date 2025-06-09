import { Choice } from "../lib/constants";
import { executeScript } from "./cmd";

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
  id?: string;
  type?: string;
  status?: string;
  description?: string;

  static formatLabels(labels: string[]) {
    return labels.map((l) => `-l${l}`);
  }

  static fromIssueResponse(i: IssueResponse) {
    const issue = new Issue(i.key);
    issue.id = i.id;
    issue.type = i.fields.issuetype.name;
    issue.status = i.fields.status.name;
    issue.description = i.fields.summary;
    return issue;
  }

  constructor(key: string) {
    this.key = key;
  }

  edit() {
    return executeScript("jira/edit", {
      args: [this.key]
    });
  }

  delete() {
    return executeScript("jira/delete", {
      args: [this.key]
    });
  }

  comment() {
    return executeScript("jira/comment", {
      args: [this.key]
    });
  }

  transition() {
    return executeScript("jira/move", {
      args: [this.key]
    });
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

  createChild(labels: string[]) {
    return executeScript("jira/create", {
      args: [this.key, ...Issue.formatLabels(labels)]
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
