import { vi } from "vitest";

import { Config } from "@lib/config";

export const mockConfigData = {
  global: {
    scripts_dir: "/mock/scripts",
    oc_config_path: "/mock/kube/config"
  },
  paths: { vault: "/path/to/vault" },
  gitlab: {
    token: "mock_gitlab_token",
    server: "https://mock_gitlab_server"
  },
  openshift: {
    auth_server_cuyo: "https://mock_auth_server_cuyo",
    auth_server_barracas: "https://mock_auth_server_barracas",
    server_cuyo: "mock_server_cuyo",
    server_barracas: "mock_server_barracas",
    mf_host_template: "template"
  },
  vault: {
    server: "http://mock_vault_sever",
    project: "mock_vault_project"
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

vi.mock("@lib/config", async () => ({
  ...await vi.importActual("@lib/config"),
  Config: {
    get: mockGet
  }
}));

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U> ? Array<DeepPartial<U>> : T[P] extends object ? DeepPartial<T[P]> : T[P];
};

function mergeWithOverride(a: any, b: any): any {
  return {
    ...a,
    ...Object.fromEntries(
      Object.entries(b).map(([key, bVal]) => [
        key,
        typeof bVal === "object" && bVal !== null && !Array.isArray(bVal) && typeof a?.[key] === "object"
          ? mergeWithOverride(a[key], bVal)
          : bVal
      ])
    )
  };
}

export const mockConfig = (cfg?: DeepPartial<Config>) => {
  mockGet.mockReturnValue(mergeWithOverride(mockConfigData, cfg));
};

export const clearMockConfig = () => mockGet.mockReturnValue(mockConfigData);
