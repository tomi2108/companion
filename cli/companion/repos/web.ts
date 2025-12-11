
import { promptForApp } from "@interface/prompts";
import { openInBrowser } from "@lib/config";

export default {
  command: "web",
  aliases: [],
  describe: "Open repository in web",
  handler: async () => {
    const { app_repo } = await promptForApp();
    if (!app_repo) return;
    const url = await app_repo.getOriginUrl();
    openInBrowser(url);
  }
};
