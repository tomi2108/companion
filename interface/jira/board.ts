import { jira } from "@jira/api";

export class Board {
  id: number;

  private jira: ReturnType<typeof jira>;

  constructor(id: number) {
    this.id = id;
    this.jira = jira();
  }

  async getCurrentSprint() {
    return (await this.jira.getAllSprints(String(this.id), 0, 1, "active")).values?.[0] ?? null;
  }
}
