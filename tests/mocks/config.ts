export class MockConfig {
  static getView = () => new MockConfigView(this.mockData);
  static mockData = {
    global: {
      scripts_dir: "/mock/scripts",
      oc_config_path: "/mock/kube/config"
    },
    paths: {
      namespaces: "/path/to/vault"
    },
    gitlab: {
      token: "mock_gitlab_token",
      server: "https://mock_gitlab_server"
    },
    openshift: {
      servers: {
        local: {
          url: "http://localhost",
          authUrl: "http://localhost"
        }
      },
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
    },
    plugins: {
      dir: "/mock/plugins",
      disabled: ["plugin2"]
    }
  };

  static setMockData(data: any) {
    MockConfig.mockData = data;
  }
}

export class MockConfigView {
  private readonly data: any;

  constructor(data?: any) {
    this.data = data ?? {};
  }

  validate(r: Record<string, unknown>) {
    return r;
  }

  get(k?: string) {
    return k ? this.data[k] : this.data;
  }
}

export const config = MockConfig.getView();
