import { Config } from "@lib/config";

import { UserProvider } from "../provider";
import { GitlabCredentials, glab } from "./api";

export class GitlabUserProvider implements UserProvider {
  glab: ReturnType<typeof glab>;

  constructor(credentials: GitlabCredentials) {
    this.glab = glab(credentials);
  }

  async me() {
    const config = Config.getView();
    const user = await this.search(config.get("gitlab.username"));
    return user;
  }

  async search(username: string) {
    const users = await this.glab.Search.all("users", username);
    const user = users[0];
    if (!user) throw new Error(`Could not find user ${username}`);
    return user;
  }

}
