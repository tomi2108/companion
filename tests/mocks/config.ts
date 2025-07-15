import { vi } from "vitest";

import { Config } from "@lib/config";

export const mockConfigData = {
  global: {
    scripts_dir: "/mock/scripts",
    oc_config_path: "/mock/kube/config"
  },
  paths: { vault: "/path/to/vault" },
  openshift: {
    auth_server_cuyo: "https://mock_auth_server_cuyo",
    auth_server_barracas: "https://mock_auth_server_barracas",
    server_cuyo: "mock_server_cuyo",
    server_barracas: "mock_server_barracas"
  },
  vault: {
    server: "mock_vault_sever"
  },
  jira: {
    project_key: "PROJ",
    username: "jira_user",
    token: "jira_token",
    server: "mock_jira_server"
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

export const mockConfig = (cfg?: Partial<Config>) => {
  mockGet.mockReturnValue({ ...mockConfigData, ...cfg });
};
