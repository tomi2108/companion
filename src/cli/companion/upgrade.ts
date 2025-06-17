import { executeScript } from "../../interface/cmd";
import path from "node:path";
import { Repo } from "../../interface/files/repo";

export default {
  command: "upgrade",
  aliases: ["up"],
  describe: "Upgrade companion",
  handler: async () => {
    const full_path = path.resolve(__dirname, "../../../");
    const repo = new Repo(full_path);
    await repo.switchBranchIfExists("master");
    await repo.pull("master");
    executeScript("install.sh", { path: full_path, cwd: full_path });
  }
};
