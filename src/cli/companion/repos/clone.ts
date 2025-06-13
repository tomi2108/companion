import { cloneGroupOrProject } from "../../../interface/glab/glab";
import { createDirIfNotExists } from "../../../interface/files/files";
import log from "../../../lib/log";
import { Config } from "../../../lib/config";

export default {
  command: "clone",
  aliases: [],
  describe: "Clone all repos and update existing ones",
  handler: async () => {
    const config = Config.get();

    const repos = config.gitlab.repos;
    const entries = Object.entries(repos);

    for (const [key, id] of entries as [keyof typeof repos, typeof repos[keyof typeof repos]][]) {
      const path = config.paths?.[key];
      if (!id && !path) continue;

      if (!id) {
        log.warning(`Could not clone repo with path ${path} and key ${key}, an id was not specified in the config`);
        continue;
      }

      if (!path) {
        log.warning(`Could not clone repo with id ${id} and key ${key}, a path was not specified in the config`);
        continue;
      }

      createDirIfNotExists(path);
      await cloneGroupOrProject(id, path);
    }
  }
};
