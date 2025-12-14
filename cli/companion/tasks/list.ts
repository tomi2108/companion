import { Dir } from "@files/dir";
import { Repo } from "@interface/dirs/repo";

export default {
  command: "list",
  aliases: [],
  describe: "List tasks",
  handler: async () => {
    const dir = new Dir("/home/tsanchen/test");
    const repo = await Repo.cloneRepo(dir, "https://github.com/tomi2108/companion.git", true);
    console.log(repo);
  }
};
