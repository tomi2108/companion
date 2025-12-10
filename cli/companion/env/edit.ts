import yaml from "js-yaml";
import path from "node:path";
import { setTimeout } from "node:timers/promises";

import { promptForOcResource, promptTmpFile } from "@interface/prompts";
import { Config, ConfigError } from "@lib/config";
import log from "@lib/log";
import { confirm, search } from "@lib/ui";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";

export default {
  command: "edit",
  aliases: ["e"],
  describe: "Edit configmap or secret",
  handler: async () => {
    if (!Config.get().paths.namespaces) throw new ConfigError("paths.namespaces");
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
      configmap.namespace = project.name;
      configmap.setData(data as Record<string, string>);
      await configmap.save({ update: true });
      return log.success("Config map saved succesfully");
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

    secret.setData(data as Record<string, string>);
    await secret.save();
    log.success("Secret saved succesfully");
    const restarts = await confirm({
      initial: true, message: `Do you want to restart every deployment affected by ${secret.name}?`
    });
    if (!restarts) return;

    await setTimeout(10 * 1000);
    const deployments = await project.getDeployments();
    const toRestart = deployments.filter((d) => d.getSecrets()?.some((s) => s.name === secret.name));
    await Promise.all(toRestart.map((d) => d.restart()));
  }
};
