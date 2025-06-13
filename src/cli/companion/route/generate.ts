import { generateRoutes, Openshift } from "../../../interface/oc/oc";
import { promptForOcResource } from "../../../interface/prompts";
import { Config } from "../../../lib/config";
import log from "../../../lib/log";
import { search } from "../../../lib/ui";
import { kebabToCamel } from "../../../lib/utils";

export default {
  command: "generate",
  describe: "Generate OpenShift routes",
  handler: async () => {

    const host_template = Config.get().openshift.mf_host_template;
    if (!host_template) {
      log.error("config.openshift.mf_host_template not found");
      process.exit(1);
    }

    const projects = await new Openshift().getProjects();
    const project = await promptForOcResource(projects);
    const types = ["frontend", "backend"];
    const type = await search({ message: "for:", choices: types });

    const deployments = await project.getDeployments();

    const port = 8080;
    if (type === "frontend") {
      // TODO: not the best, find another way to filter out micro_front_end deployments
      const frontend_deployments = deployments.filter((e) => e.name.startsWith("app-"));
      const env = frontend_deployments[0].env;
      const host = host_template.replaceAll("{{env}}", env as string);

      for (const deployment of frontend_deployments) {
        const service = deployment.name;
        const camelCaseName = kebabToCamel(service.slice(4)); // works only if mf starts with app-, should change when the TODO above is changed probably
        const pathname = `/app/${camelCaseName}`;
        const insecurePolicy = "Redirect";

        generateRoutes(service, port, insecurePolicy, pathname, host);
      }
    }
    // TODO: backend routes
  }
};
