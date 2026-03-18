import { Octokit } from "octokit";

import { UserProvider } from "../provider";
import { ghub } from "./api";

export class GithubUserProvider implements UserProvider {
  private ghub: Octokit;

  constructor() {
    this.ghub = ghub();
  }

  async me() {
    const res = await this.ghub.rest.users.getAuthenticated();
    return { username: res.data.login, id: res.data.id };
  }

  async search(username: string) {
    const res = await this.ghub.rest.users.getByUsername({ username });
    return { username: res.data.login, id: res.data.id };
  }
}
