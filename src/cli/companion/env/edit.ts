import { getOcToken, Openshift } from "../../../interface/oc/oc";
import { search, confirm } from "../../../lib/ui";
import { promptForOcResource, promptTmpFile } from "../../../interface/prompts";
import path from "node:path";
import yaml from "js-yaml";
import log from "../../../lib/log";
import { Config } from "../../../lib/config";

export default {
  command: "edit",
  aliases: ["e"],
  describe: "Edit configmap or secret",
  handler: async () => {
    if (!Config.get().paths.vault) throw new Error("Vault path not set");
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
      const { changed, new_content } = await promptTmpFile(tmp_file, await configmap.toYaml());
      if (!changed || !new_content) return log.info("Edit canceled, no changes made");
      const y = yaml.load(new_content);
      if (!y
        || typeof y !== "object"
        || !("data" in y)
        || typeof y.data !== "object"
        || !y.data
      ) return log.error("Invalid yaml, please sepcify 'data' key");
      const { data } = y;
      await configmap.save(project.name, data as Record<string, string>);
      return log.info("Config map saved succesfully");
    }

    const secrets = await project.getSecrets();
    const secret = await promptForOcResource(secrets);
    const tmp_file = path.join("secrets", "edit", `${secret.name}.yaml`);
    const { changed, new_content } = await promptTmpFile(tmp_file, await secret.toYaml());
    if (!changed || !new_content) return log.info("Edit canceled, no changes made");
    const y = yaml.load(new_content);
    if (!y
      || typeof y !== "object"
      || !("data" in y)
      || typeof y.data !== "object"
      || !y.data
    ) return log.error("Invalid yaml, please sepcify 'data' key");
    const { data } = y;
    await secret.save(project.name, data as Record<string, string>);
    log.info("Secret saved succesfully");
    const restarts = await confirm({
      initial: true, message: `Do you want to restart every deployment affected by ${secret.name}?`
    });
    if (!restarts) return;

    // TODO: probably check every 30s if pipeline is done and then execute this
    //
    const deployments = await project.getDeployments();
    for (const d of deployments) {
      if (!d.getSecrets()?.some((s) => s.name === secret.name)) continue;
      await d.restart();
    }
  }
};
