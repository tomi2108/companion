import { openInEditor, readdirs } from "../../../lib/utils";
import { Config } from "../../../lib/config";
import { search } from "../../../lib/ui";
import path from "node:path";

export default {
  command: "open",
  aliases: [],
  describe: "Open repository",
  handler: async () => {
    const choices = [
      ...readdirs(Config.get().paths.despliegues) ?? [],
      ...readdirs(Config.get().paths.frontend) ?? [],
      ...readdirs(Config.get().paths.backend) ?? []
    ].map((p) => ({ name: path.join(p.path, p.name) }));

    const selectedProjects = await search({ choices, multiple: true, message: "Select projects to open" });

    for (const project of selectedProjects) {
      openInEditor(project);
    }
  }
};
