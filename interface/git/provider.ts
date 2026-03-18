import { MergeRequest } from "@interface/git/merge_request";
import { Project } from "@oc/project";

import { GitIssue } from "./issue";
import { GitProject } from "./project";
import { GitUser } from "./user";

export interface IssueProvider {
  createIssue(project: GitProject, opts: { title: string; description: string }): Promise<GitIssue>;
  createArgoIssue(appName: string, version: string, project: Project): Promise<GitIssue>;
}

export interface ProjectProvider {
  getProject(id: string): Promise<GitProject>;
  getProjects(id: string): Promise<GitProject[]>;
  getLatestRelease(project: GitProject): Promise<string>;
  search(name: string, pathname: string): Promise<GitProject>;
  createAppProject(opts: { name: string; groupId: string; description?: string }): Promise<GitProject>;
}

export interface MergeRequestProvider {
  getMergeRequests(project: GitProject): Promise<MergeRequest[]>;
  create(project: GitProject, opts: {
    sourceBranch: string;
    targetBranch: string;
    title: string;
    description?: string;
  }): Promise<MergeRequest>;
  merge(mr: MergeRequest): Promise<void> | void;
  approve(mr: MergeRequest): Promise<void> | void;
  close(mr: MergeRequest): Promise<void> | void;
}

export interface UserProvider {
  search(username: string): Promise<GitUser>;
  me(): Promise<GitUser>;
}

export interface GitProvider {
  issues: IssueProvider;
  projects: ProjectProvider;
  mergeRequests: MergeRequestProvider;
  users: UserProvider;
}

