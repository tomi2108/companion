import { vi } from "vitest";

import { Dir } from "@interface/dirs/dir";
import { ExecutionContext, GitProvider } from "@lib/index";

import { MockUi } from "./ui";

// eslint-disable-next-line prefer-const
let mockMergeRequestProvider: any;

const mockMR = async () => ({
  id: 1,
  iid: 1,
  project_id: 1,
  provider: mockMergeRequestProvider,
  title: "Mock MR",
  state: "opened",
  description: "Mock MR",
  web_url: "https://mock.mr",
  merge: vi.fn(async () => await mockMR()),
  close: vi.fn(async () => await mockMR()),
  approve: vi.fn(async () => await mockMR()),
  openInBrowser: () => { },
  toChoice: () => ({ name: "Mock MR" })
});

mockMergeRequestProvider = {
  getMergeRequests: async () => [await mockMR()],
  create: mockMR,
  merge: mockMR,
  approve: mockMR,
  close: mockMR
};

export class MockLogger {
  calls = {
    info: [] as any[],
    warn: [] as any[],
    error: [] as any[],
    debug: [] as any[],
    success: [] as any[],
    warning: [] as any[]
  };
  info = (...args: any[]) => {
    this.calls.info.push(args);
  };
  warn = (...args: any[]) => {
    this.calls.warn.push(args);
  };
  warning = (...args: any[]) => {
    this.calls.warning.push(args);
  };
  error = (...args: any[]) => {
    this.calls.error.push(args);
  };
  success = (...args: any[]) => {
    this.calls.success.push(args);
  };
  debug = (...args: any[]) => {
    this.calls.debug.push(args);
  };
  reset = () => {
    this.calls.info = [];
    this.calls.warn = [];
    this.calls.error = [];
    this.calls.debug = [];
    this.calls.success = [];
    this.calls.warning = [];
  };
}

export class MockGitProvider implements GitProvider {
  issues = {
    createIssue: async () => ({ id: 1, web_url: "https://mock.url" }),
    createArgoIssue: async () => ({ id: 1, web_url: "https://mock.url" })
  };
  projects = {
    getProject: async () => ({ id: 1, name: "mock-project", http_url_to_repo: "https://mock.repo" }),
    getProjects: async () => [],
    getLatestRelease: async () => "mock-release",
    search: async () => ({ id: 1, name: "mock-project", http_url_to_repo: "https://mock.repo" }),
    createAppProject: async () => ({ id: 1, name: "mock-project", http_url_to_repo: "https://mock.repo" })
  };
  mergeRequests = mockMergeRequestProvider;
  users = {
    search: async () => ({ id: 1, username: "mockuser", name: "Mock User" }),
    me: async () => ({ id: 1, name: "Mock User", username: "mockuser" })
  };
}

export class MockExecutionContext implements ExecutionContext {
  ui = new MockUi();
  env = {};
  gitProvider = new MockGitProvider();
  cwd = new Dir("/mock/cwd");
  logger = new MockLogger();
  reset() {
    this.cwd.delete();
    this.logger.reset();
  }
}

export const ctx = new MockExecutionContext();
