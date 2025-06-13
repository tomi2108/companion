import { getDeployments, generateRoutes, Resource, Openshift } from "../../../interface/oc";
import { promptForOcResource } from "../../../interface/prompts";
import { Config } from "../../../lib/config";
import log from "../../../lib/log";
import { search } from "../../../lib/ui";
import { kebabToCamel } from "../../../lib/utils";

export default {
  command: "generate",
  describe: "Generate OpenShift routes",
  handler: async () => {

    const projects = await new Openshift().getProjects();
    const project = await promptForOcResource(projects);
    const types = ["frontend", "backend"];
    const type = await search({ message: "for:", choices: types });

    const deployments = getDeployments(project);

    const port = 8080;
    if (type === "frontend") {
      // TODO: not the best, find another way to filter out front_end deployments
      const frontend_deployments = deployments.items.filter((e: Resource) => e.metadata.name.startsWith("app-"));

      const host_template = Config.get().openshift.mf_host_template;
      if (!host_template) {
        log.error("config.openshift.mf_host_template not found");
        process.exit(1);
      }
      const env = frontend_deployments[0].spec.template.metadata.labels["app.environment"];
      const host = host_template.replaceAll("{{env}}", env);

      for (const deployment of frontend_deployments) {
        const service = deployment.metadata.name;
        const camelCaseName = kebabToCamel(service.slice(4));
        const pathname = `/app/${camelCaseName}`;
        const insecurePolicy = "Redirect";

        generateRoutes(service, port, insecurePolicy, pathname, host);
      }
    }
  }
};
