import { Dir } from "@files/dir";
import { Config } from "@lib/config";
import { search } from "@lib/ui";

export default {
  command: "open",
  aliases: [],
  describe: "Open repository",
  handler: async () => {
    const dirs: Dir[] = [];
    const paths = Object.values(Config.get().paths) as (string | undefined)[];

    for (const path of paths) {
      if (path) dirs.push(...new Dir(path).readDirs());
    }

    const choices = dirs.map((d) => d.toChoice());
    const choice = await search({ choices, multiple: true, message: "Select projects to open" });
    if (choice.length === 0) return process.exit(1);

    for (const project of choice) {
      const dir = dirs.find((d) => d.toChoice().name === project)!;
      process.cwd = () => dir.path;
      dir.openInEditor();
    }
  }
};
