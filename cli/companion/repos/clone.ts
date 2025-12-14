import { Dir } from "@files/dir";
import { Gitlab } from "@glab";
import { Config } from "@lib/config";
import log from "@lib/log";
import { multiProgressBar } from "@lib/ui";

export default {
  command: "clone",
  aliases: [],
  describe: "Clone all repos and update existing ones",
  handler: async () => {
    const config = Config.get();

    const repos = config.gitlab.repos;
    const entries = Object.entries(repos) as [keyof typeof repos, typeof repos[keyof typeof repos]][];

    const multi = multiProgressBar();

    await Promise.all(entries.map(
      async ([key, id]) => {
        const path = config.paths?.[key];
        if (!id && !path) return;
        if (!id) return log.warning(`Could not clone repo with path ${path} and key ${key}, an id was not specified in the config`);
        if (!path) return log.warning(`Could not clone repo with id ${id} and key ${key}, a path was not specified in the config`);

        const bar = multi.create(0, 0);
        bar.setPrefix(key);
        bar.setTotal(1);
        await new Gitlab().cloneGroupOrProject(new Dir(path), id, bar);
        bar.stop();
      }));
    multi.stop();
  }
};
