// import { getApp } from "../../../interface/files/files";
import inquirer from "inquirer";
import { Config } from "../../../lib/config";
import log from "../../../lib/log";
import { readdirs } from "../../../lib/utils";
import { input, search } from "../../../lib/ui";
import { Gitlab } from "../../../interface/glab/glab";

export default {
  command: "create",
  aliases: "c",
  describe: "Create GitLab issues for app deployment",
  handler: async () => {
    const argocd_path = Config.get().paths.argocd;
    const ms_repos_path = Config.get().paths.backend;
    const mf_repos_path = Config.get().paths.frontend;
    const glab_user = Config.get().gitlab.username;

    if (!argocd_path || !ms_repos_path || !mf_repos_path || !glab_user) {
      log.error("Required paths or GitLab user not set in configuration");
      process.exit(1);
    }

    const appsFronts = readdirs(mf_repos_path)?.map((dir) => dir.name) ?? [];
    const microservices = readdirs(ms_repos_path)?.map((dir) => dir.name) ?? [];

    const choices = [
      {
        name: "Apps Fronts",
        value: "fronts",
        children: appsFronts
      },
      {
        name: "Microservices",
        value: "microservices",
        children: microservices
      }
    ];
    let category: string | null = null;
    let app: string | null = null;

    while (!app) {
      if (!category) {
        const categoryResponse = await inquirer.prompt([
          {
            type: "list",
            name: "category",
            message: "Select a category",
            choices: [
              ...choices.map((choice) => ({
                name: choice.name,
                value: choice.value
              })),
              { name: "Exit", value: "exit" }
            ]
          }
        ]);

        if (categoryResponse.category === "exit") {
          log.info("Exiting...");
          process.exit(0);
        }

        category = categoryResponse.category;
      } else {
        const selectedCategory = choices.find((choice) => choice.value === category);

        if (!selectedCategory) {
          log.error("Invalid category selected");
          process.exit(1);
        }

        const appResponse = await inquirer.prompt([
          {
            type: "list",
            name: "app",
            message: `Select an app from ${selectedCategory.name}`,
            choices: [
              ...selectedCategory.children.map((child) => ({
                name: child,
                value: child
              })),
              { name: "Back", value: "back" }
            ]
          }
        ]);

        if (appResponse.app === "back") {
          category = null; // Regresar al paso anterior
        } else {
          app = appResponse.app;
        }
      }
    }
    const envs = ["dev", "int", "cert", "prod"];
    const env = await search({
      choices: envs,
      message: "Pick environment"
    });

    if (!env) {
      log.error("No environment selected");
      process.exit(1);
    }

    const version = await input({
      message: "Enter version:"
    });

    if (!version) {
      log.error("No version entered");
      process.exit(1);
    }

    const namespace = env === "prod" ? "movistar-empresas" : `movistar-empresas-${env}`;
    const title = `${app}-${env}`;
    const description = `
        platform: openshift
        project: empresas
        namespace: ${namespace}
        deployment: ${app}
        version: ${version}
        `;

    const gitlab = new Gitlab();

    await gitlab.createIssue({
      title,
      description,
      assignee: glab_user,
      projectId: 6986
    });
    console.log(`Creating issues for app: ${app}`);
    // const { app_repo } = await getApp(deployment.name);
  }
};