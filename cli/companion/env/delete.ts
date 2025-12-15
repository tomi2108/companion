import { promptForOcResource } from "@interface/prompts";
import log from "@lib/log/default";
import { confirm, search } from "@lib/ui";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";
import { Resource } from "@oc/resource";

export default {
  command: "delete",
  aliases: ["del", "rm"],
  describe: "Delete configmap or secret",
  handler: async () => {
    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects);

    const choices = ["configmap", "secret"];
    const type = await search({ message: "Choose type of resource to delete", choices });
    if (!type) process.exit(1);

    let r: Resource;
    if (type === "configmap") {
      const configmaps = await project.getConfigMaps();
      const configmap = await promptForOcResource(configmaps);
      r = configmap;
    } else {
      const secrets = await project.getSecrets();
      const secret = await promptForOcResource(secrets);
      r = secret;
    }

    const confirmed = await confirm({ message: `Are you sure you want to delete ${r.name}?` });
    if (confirmed) {
      await r.delete();
      return log.success(`Deleted ${r.name} correctly`);
    }
    log.info("Delete canceled");
  }
};
