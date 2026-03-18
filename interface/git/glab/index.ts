import { GitProvider, IssueProvider, MergeRequestProvider, ProjectProvider, UserProvider } from "../provider";
import { GitlabCredentials } from "./api";
import { GitlabIssueProvider } from "./issues";
import { GitlabMergeRequestProvider } from "./merge_requests";
import { GitlabProjectProvider } from "./projects";
import { GitlabUserProvider } from "./users";

export class Gitlab implements GitProvider {
  issues: IssueProvider;
  projects: ProjectProvider;
  mergeRequests: MergeRequestProvider;
  users: UserProvider;

  constructor(credentials: GitlabCredentials) {
    this.projects = new GitlabProjectProvider(credentials);
    this.mergeRequests = new GitlabMergeRequestProvider(credentials);
    this.users = new GitlabUserProvider(credentials);
    this.issues = new GitlabIssueProvider(credentials);
  }

}
