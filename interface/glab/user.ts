import { glab } from "@glab/api";

export class GitlabUser {
  username: string;
  private glab: ReturnType<typeof glab>;

  constructor(username: string) {
    this.username = username;
    this.glab = glab();
  }

  async getId() {
    return (await this.glab.Search.all("users", this.username))[0]?.id;
  }
}
