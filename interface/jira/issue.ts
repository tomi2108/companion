import { jira } from "@jira/api";
import { Config, openInBrowser } from "@lib/config";
import { Choice } from "@lib/constants";

import { Board } from "./board";
import { JiraProject } from "./project";
import { JiraUser } from "./user";

export type IssueType = { id: string; name: string };
export type IssueResponse = {
  id: string;
  key: string;
  fields: {
    issuetype: IssueType;
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
    issue.type = i.fields?.issuetype.name;
    issue.status = i.fields?.status.name;
    issue.description = i.fields?.summary;
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
    // TODO: implement
  }

  openInBrowser() {
    openInBrowser(`https://${Config.get().jira.server}/browse/${this.key}`);
  }

  async link(issue: Issue, linkType: any) {
    // TODO: test
    return await this.jira.issueLink({
      inwardIssue: { id: this.id },
      outWardIssue: { id: issue.id },
      type: linkType
    });
  }

  async unlink(issue: Issue) {
    // TODO: implement
    console.log("issue:", issue);
  }

  async logWork(work: string) {
    // TODO: test, maybe make 'work' a :number in hours ?
    return await this.jira.addWorklog(this.id, { timeSpent: work });
  }

  async createChild(opts: {
    title: string;
    description?: string;
    labels?: string[];
    user: JiraUser;
    project: JiraProject;
  }) {
    const labels = opts.labels ?? Config.get().jira.labels ?? [];
    // TODO: probably make this a param not every child sould be the same issuetype... i think
    const issuetype = opts.project.issueTypes?.find((t) => t.name === "Tarea");
    if (!issuetype) throw new Error("Could not find proper issue type to create child");
    return Issue.fromIssueResponse(await this.jira.addNewIssue({
      fields: {
        assignee: {
          id: opts.user.id
        },
        issuetype: {
          id: issuetype.id
        },
        project: {
          id: opts.project.id
        },
        labels,
        description: opts.description,
        summary: opts.title,
        reporter: {
          id: opts.user.id
        },
        parent: {
          key: this.key
        }
      }
    }) as IssueResponse
    );
  }

  async addToCurrentSprint() {
    // TODO: test
    const board_id = Config.get().jira.board_id;
    if (!board_id) throw new Error("No board id set");
    const sprint = await new Board(board_id).getCurrentSprint();
    if (!sprint) throw new Error("There is no active sprint");
    return await this.jira.addIssueToSprint(this.id, sprint.id);
  }

  async assign(user: string) {
    // TODO: test
    return await this.jira.updateAssignee(this.key, user);
  }

  async estimate(estimacion: string) {
    // TODO: test
    const board_id = Config.get().jira.board_id;
    if (!board_id) throw new Error("Board id not set");
    return await this.jira.estimateIssueForBoard(this.id, board_id, estimacion);
  }

  toChoice(): Choice {
    return { name: this.key, hint: `[${this.type}] (${this.status}) ${this.description}` };
  }
}
