import { Argv } from "yargs";

import { promptChoice } from "@interface/prompts";
import { Config } from "@lib/config";
import { Openshift } from "@oc";
import { filterFrontendDeployments, getOcToken } from "@oc/api";

export default {
  command: "generate",
  aliases: ["gen"],
  describe: "Generate self containing configmaps",
  builder: (yargs: Argv) => yargs
    .boolean("all")
    .alias("all", ["a"])
    .describe("all", "Whether to run the script for all repositories"),
  handler: async ({ all }: { all?: boolean }) => {
    const config = Config.get();
    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptChoice(projects);

    const prefix = config.envs.generate?.prefix ?? "";
    const excluded = config.envs.generate?.exclusions ?? [];
    const excluded_prefix = config.envs.generate?.prefix_exclusions ?? [];

    const choices = (await project.getDeployments())
      .filter((d) => !filterFrontendDeployments(d))
      .filter((d) => !excluded.includes(d.name))
      .filter((d) => !excluded_prefix.some((p) => d.name.split(prefix)[1]?.startsWith(p)));

    const configmaps = await project.getConfigMaps();
    const deployments = all ? choices : [await promptChoice(choices)];
    for (const d of deployments) {
      if (configmaps.some((c) => c.name === d.name)) {
        console.log("Configmap", `'${d.name}'`, "already exists");
        continue;
      }
      const env_name = d.name.split(prefix)[1]?.toUpperCase().replaceAll("-", "_") + "_URL";
      const env_value = `http://${d.name}.${project.name}.svc.cluster.local:8080`;
      await project.createConfigMap(d.name, { [env_name]: env_value });
      console.log("Created configmap", `'${d.name}'`);
    }
  }
};
