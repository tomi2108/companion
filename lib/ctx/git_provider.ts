import { Gitlab } from "@glab";
import { Github } from "@interface/git/ghub";
import { ConfigView } from "@lib/config/view";

export class GitProviderFactory {

  static getGithub() {
    return new Github();
  }

  static getGitlab(config: ConfigView) {
    return new Gitlab({
      server: config.get("gitlab.server"),
      token: config.get("gitlab.token")
    });
  }

  static get(key: "github" | "gitlab", config: ConfigView) {
    return {
      github: this.getGithub(),
      gitlab: this.getGitlab(config)
    }[key];
  }

  static getProvider(config: ConfigView) {
    return this.get(config.get("preferences.git_provider"), config);
  }
}
