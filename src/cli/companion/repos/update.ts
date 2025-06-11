import { Repo } from "../../../interface/repo";
import { Config } from "../../../lib/config";
import log from "../../../lib/log";
import { readdirs } from "../../../lib/utils";
import path from "node:path";

export default {
  command: "update",
  aliases: [],
  describe: "Update all repositories",
  handler: async () => {
    // TODO: clone missing repositories

    const repos = Array.from(new Set(
      Object.values(Config.get().paths)
        .flatMap((full_path) =>
          readdirs(full_path)
            .map((p) => path.join(full_path, p))
        )
        .filter(Repo.isGitRepo)
    ));

    await Promise.all(
      repos.map(
        async (path) => {
          log.info(`Updating ${path}`);
          await new Repo(path).update();
        }
      )
    );
  }
};
