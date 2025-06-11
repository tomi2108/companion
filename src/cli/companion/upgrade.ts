import { executeScript } from "../../interface/cmd";
import path from "node:path";
import { Repo } from "../../interface/repo";

export default {
  command: "upgrade",
  aliases: ["up"],
  describe: "Upgrade companion",
  handler: async () => {
    const full_path = path.resolve(__dirname, "../../../");
    const repo = new Repo(full_path);
    await repo.pull();
    executeScript("install.sh", { path: full_path, cwd: full_path });
  }
};
