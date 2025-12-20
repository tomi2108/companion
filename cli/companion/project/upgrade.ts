import { ExecutionContext } from "@lib/ctx";
import { filterFrontendDeployments } from "@oc/api";
import { Deployment } from "@oc/deployment";
import { DeployApp } from "@workflow/steps/app/DeployApp";
import { GetAppRepo } from "@workflow/steps/app/GetAppRepo";
import { GetDeployRepo } from "@workflow/steps/app/GetDeployRepo";
import { ForEach } from "@workflow/steps/flow/ForEach";
import { GetDeployments } from "@workflow/steps/oc/deployments/GetDeployments";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { Workflow } from "@workflow/workflow";

export default {
  command: "upgrade",
  aliases: ["up"],
  describe: "Upgrade all apps to the latest version in a project",
  handler: async () => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new PromptOcProject({ server: "cuyo" }),
      new GetDeployments({
        // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/companion/-/issues/67]: make this script also upgrade frontend deployments
        transform: ({ deployments }) => ({ deployments: deployments.map((d) => !filterFrontendDeployments(d)) })
      }),
      new ForEach({
        item: "deployment",
        items: (state: { deployments: Deployment[] }) => state.deployments,
        concurrency: 10,
        step: new Workflow([
          new GetDeployRepo(),
          new GetAppRepo(),
          new AppGetLatest(),
          new DeployApp()
        ])
      })

    ]).run(ctx);

    // const tags = await app_repo.getTags();
    // // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/companion/-/issues/70]: this is only right for backend deployments
    // // for frontend deployments we should look for -beta, -rc for different namespaces
    // // find a good way to represent this in the config, this should be used in companion app status as well
    // const last_version = tags[0];
    // if (!last_version) return errors.push(`Could not find tag for app ${d.name}, skipped`);
    // const namespace = project.name;
    // if (last_version === deploy_repo.getDeployment(namespace)?.getVersion()) return;
    // return await deploy_repo.deploy([{ name: namespace, configmaps: [], secrets: [] }], last_version);
  }
};
