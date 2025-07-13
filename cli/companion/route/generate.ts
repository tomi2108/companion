import { promptForOcResource } from "@interface/prompts";
import { Config } from "@lib/config";
import log from "@lib/log";
import { search } from "@lib/ui";
import { kebabToCamel } from "@lib/utils";
import { filterFrontendDeployments, getOcToken, Openshift } from "@oc";
import axios from "axios";

export default {
  command: "generate",
  describe: "Generate OpenShift routes",
  handler: async () => {

    const host_template = Config.get().openshift.mf_host_template;
    if (!host_template) {
      log.error("config.openshift.mf_host_template not found");
      process.exit(1);
    }

    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects);
    const types = ["frontend", "backend"];
    const type = await search({ message: "for:", choices: types });

    // I think getting Services is technically more correct since routes are linked to Services
    // but I think they will always have the same name and env which is what we care about here
    // if we ever implement project.getServices() definetely use it here
    const deployments = await project.getDeployments();

    const port = 8080;
    if (type === "frontend") {
      const frontend_deployments = deployments.filter(filterFrontendDeployments);
      const env = frontend_deployments?.[0]?.env;
      const host = host_template.replaceAll("{{env}}", env as string);

      for (const deployment of frontend_deployments) {
        const serviceName = deployment.name;

        // works only if mf starts with app-, should change when the TODO above is changed probably
        const camelCaseName = kebabToCamel(serviceName.slice(4));

        const pathname = `/app/${camelCaseName}`;
        const insecurePolicy = "Redirect";
        const termination = "edge";
        try {
          await project.createRoute({ serviceName, port, insecurePolicy, pathname, host, termination });
          log.info(`Created route '${serviceName}'`);
        } catch (err) {
          if (axios.isAxiosError(err) && err.response?.data?.reason === "AlreadyExists") {
            log.warning(`Route '${serviceName}' already exists`);
          }
        }
      }
    }
    // TODO: backend routes
  }
};
