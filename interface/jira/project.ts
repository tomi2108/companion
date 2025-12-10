import { IssueType } from "./issue";

export type JiraProjectReponse = {
  id: string;
  key: string;
  issueTypes: IssueType[];
};

export class JiraProject {
  id: string;
  key: string;
  issueTypes?: IssueType[];

  static fromJiraProjectResponse(res: JiraProjectReponse) {
    const project = new JiraProject(res.id, res.key);
    project.issueTypes = res.issueTypes;
    return project;
  }

  constructor(id: string, key: string) {
    this.id = id;
    this.key = key;
  }

}
