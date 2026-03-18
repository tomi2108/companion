import { GitProvider } from "../provider";
import { GithubIssueProvider } from "./issues";
import { GithubMergeRequestProvider } from "./merge_requests";
import { GithubProjectProvider } from "./projects";
import { GithubUserProvider } from "./user";

export class Github implements GitProvider {
  issues = new GithubIssueProvider();
  projects = new GithubProjectProvider();
  mergeRequests = new GithubMergeRequestProvider();
  users = new GithubUserProvider();
}
