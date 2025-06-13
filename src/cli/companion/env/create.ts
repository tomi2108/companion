import log from "../../../lib/log";
import { search, input } from "../../../lib/ui";
import { promptForOcResource, promptTmpFile } from "../../../interface/prompts";
import { Openshift } from "../../../interface/oc/oc";
import { parseKeyVal } from "../../../lib/utils";

export default {
  command: "create",
  aliases: [],
  describe: "Create configmap or secret",
  handler: async () => {

    const projects = await new Openshift().getProjects();
    const project = await promptForOcResource(projects);

    const choices = ["configmap", "secret"];
    const resource = await search({ message: "Choose type of resource to create", choices });
    if (!resource) process.exit(1);

    const name = await input({ message: `Enter a name for the new ${resource}` });
    if (!name) process.exit(1);

    const { changed, new_content } = await promptTmpFile(`${name}-${resource}`, "KEY=VALUE");

    if (!changed) {
      log.info("Create canceled, no changes made");
      process.exit(0);
    }
    const data = parseKeyVal(new_content);
    if (resource === "secret") await project.createSecret(name, data);
    if (resource === "configmap") await project.createConfigMap(name, data);
  }
};
