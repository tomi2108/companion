import { Config } from "@lib/config";
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

const mockGet = vi.fn().mockReturnValue(mockConfigData);

vi.mock("@lib/config", () => ({
  Config: {
    get: mockGet
  }
}));

export const mockConfig = (cfg: Partial<Config>) => {
  mockGet.mockReturnValueOnce({ ...mockConfigData, cfg });
};
