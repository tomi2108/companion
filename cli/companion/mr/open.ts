import { Dir } from "@files/dir";
import { Repo } from "@interface/dirs/repo";
import { promptForMr } from "@interface/prompts";
import { getCurrentPath } from "@lib/utils";

export default {
  command: "open",
  aliases: [],
  describe: "Open merge request in browser",
  handler: async () => {
    const dir = new Dir(getCurrentPath());
    const repo = new Repo(dir);
    const mr = await promptForMr(repo);
    mr.openInBrowser();
  }
};
