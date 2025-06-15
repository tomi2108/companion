import { getOcToken, Openshift } from "../../../interface/oc/oc";
import { search } from "../../../lib/ui";
import { promptForOcResource, promptTmpFile } from "../../../interface/prompts";
import path from "node:path";
import yaml from "js-yaml";
import log from "../../../lib/log";

export default {
  command: "edit",
  aliases: ["e"],
  describe: "Edit configmap or secret",
  handler: async () => {
    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects);

    const choices = ["configmap", "secret"];
    const type = await search({ message: "Choose type of resource to edit", choices });
    if (!type) process.exit(1);

    if (type === "configmap") {
      const configmaps = await project.getConfigMaps();
      const configmap = await promptForOcResource(configmaps);
      const tmp_file = path.join("configmaps", "edit", `${configmap.name}.yaml`);
      const { changed, new_content } = await promptTmpFile(tmp_file, configmap.toYaml());
      if (!changed || !new_content) log.info("Edit canceled, no changes made");
      const y = yaml.load(new_content);
      if (!y
        || typeof y !== "object"
        || !("data" in y)
        || typeof y.data !== "object"
        || !y.data
      ) return log.error("Invalid yaml, please sepcify 'data' key");
      const { data } = y;
      configmap.edit(data as Record<string, string>);
    } else {
      const secrets = await project.getSecrets();
      const secret = await promptForOcResource(secrets);
      const tmp_file = path.join("secrets", "edit", `${secret.name}.yaml`);
      const { changed, new_content } = await promptTmpFile(tmp_file, secret.toYaml());
      if (!changed || !new_content) log.info("Edit canceled, no changes made");
      const y = yaml.load(new_content);
      if (!y
        || typeof y !== "object"
        || !("data" in y)
        || typeof y.data !== "object"
        || !y.data
      ) return log.error("Invalid yaml, please sepcify 'data' key");
      const { data } = y;
      secret.edit(data as Record<string, string>);
    }
  }
};
