import { vi } from "vitest";

export const mockConfigData = {
  global: {
    scripts_dir: "/mock/scripts",
    oc_config_path: "/mock/kube/config"
  },
  jira: {
    project_key: "PROJ",
    username: "jira_user",
    token: "jira_token",
    server: "jira.example.com"
  },
  preferences: {
    logs_path: "/mock/logs",
    browser: "firefox",
    editor: "nano"
  }
};

vi.mock("../../lib/config", () => ({
  Config: {
    get: vi.fn(() => mockConfigData)
  }
}));
