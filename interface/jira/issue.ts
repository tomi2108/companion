import { Jira, jira } from "@jira";
import { Config } from "@lib/config";
import { Choice } from "@lib/constants";
import { openInBrowser } from "@lib/utils";

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

  async createChild(labels?: string[]) {
    console.log("labels:", labels);
    // TODO: probably recieve more fields for title, description etc
    // should ideally return the created issue wrapped in a new Issue()
    // maybe with Issue.fromIssueResponse()
    return await this.jira.addNewIssue({
    });
  }

  async addToCurrentSprint() {
    // TODO: test
    const sprint = await new Jira().getCurrentSprint();
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
