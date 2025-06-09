#!/usr/bin/env node

const { login, getDeployments, generateRoutes } = require("../../../interface/oc.cjs");
const { promptForOcProject } = require("../../../interface/prompts.cjs");
const { search } = require("../../../lib/ui.cjs");
const { kebabToCamel } = require("../../../lib/utils.cjs");

module.exports = {
  command: "generate",
  describe: "Generate OpenShift routes",
  handler: async () => {

    login();
    const project = await promptForOcProject();
    const types = ["frontend", "backend"];
    const type = await search({ choices: types });

    const deployments = getDeployments(project);

    const port = 8080;
    if (type === "frontend") {
      const frontend_deployments = deployments.items.filter((e) => e.metadata.name.startsWith("app-"));

      const host_template = "{{env}}-mimovistarempresas.movistar.com.ar";
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
