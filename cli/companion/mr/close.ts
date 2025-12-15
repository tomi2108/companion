import { Dir } from "@files/dir";
import { Repo } from "@interface/dirs/repo";
import { promptForMr } from "@interface/prompts";
import { getCurrentPath } from "@lib/utils";

export default {
  command: "close",
  aliases: [],
  describe: "Close merge request",
  handler: async () => {
    const dir = new Dir(getCurrentPath());
    const repo = new Repo(dir);
    const mr = await promptForMr(repo);
    await mr.close();
  }
};
