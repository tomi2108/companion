import path from "node:path";

import { Config } from "@lib/config";
import { search } from "@lib/ui";
import { openInEditor, readdirs } from "@lib/utils";

export default {
  command: "open",
  aliases: [],
  describe: "Open repository",
  handler: async () => {
    const choices = [
      ...readdirs(Config.get().paths.despliegues) ?? [],
      ...readdirs(Config.get().paths.frontend) ?? [],
      ...readdirs(Config.get().paths.backend) ?? []
    ].map((p) => ({ name: path.join(p.parentPath, p.name) }));

    const selectedProjects = await search({ choices, multiple: true, message: "Select projects to open" });
    if (selectedProjects.length === 0) return process.exit(1);

    for (const project of selectedProjects) {
      process.cwd = () => project;
      openInEditor(project);
    }
  }
};
