import { APP_TYPES, AppType } from "@lib/constants";
import { ExecutionContext } from "@lib/ctx";
import { AppNew } from "@workflow/steps/app/AppNew";
import { ValidateConfig } from "@workflow/steps/config/ValidateConfig";
import { If } from "@workflow/steps/flow/If";
import { Input } from "@workflow/steps/ui/Input";
import { Search } from "@workflow/steps/ui/Search";
import { Workflow } from "@workflow/workflow";
// import { findArgoPipeline, findCIPipeline, findSyncPipeline, waitForPipeline } from "@oc/utils";

export default {
  command: "new",
  aliases: ["n"],
  describe: "Create a new app from template",
  handler: async () => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new ValidateConfig({
        keys: [
          "gitlab.repos.despliegues",
          "paths.despliegues",
          "paths.argocd"
        ]
      }),
      new Search({
        transform: ({ choice }) => ({ app_type: choice }),
        choices: APP_TYPES,
        message: "Choose app type"
      }),
      new Input({ message: "Enter name", write: "name" }),
      new Input({ message: "Enter description", write: "description" }),
      // TODO: When waiting for pipeline works this will be used to deploy
      // the new app, PromptOcProject should support "multiple" to deploy
      // in multiple projects
      // new PromptOcProject({
      //   server: "cuyo"
      // }),
      new If({
        condition: ({ app_type }: { app_type: AppType }) => app_type === "app",
        then: new Workflow([
          new ValidateConfig({ keys: ["paths.frontend", "gitlab.repos.frontend"] }),
          AppNew.frontend()
        ]),
        else: new Workflow([
          new ValidateConfig({ keys: ["paths.backend", "gitlab.repos.backend"] }),
          AppNew.backend()
        ])
      })

    ]).run(ctx);
    // TODO: When waiting for pipelines works
    //
    // const initial_version = type === "app" ? "v1.0.0-beta.1" : "v1.0.0";
    //   const ci_pipeline = await findCIPipeline(app_repo);
    //   if (!ci_pipeline) return log.error("Could not find ci pipeline");
    //   const ci_status = await waitForPipeline(ci_pipeline);
    //   if (ci_status === PipelineStatus.failed) return log.error("CI pipeline failed");
    //
    //   for (const project of projects_to_deploy) {
    //     await new Gitlab().createArgoIssue(name, initial_version, project);
    //     const argo_pipeline = await findArgoPipeline(app_repo, project);
    //     if (!argo_pipeline) return log.error("Could not find argo pipeline");
    //     const status = await waitForPipeline(argo_pipeline);
    //     if (status === PipelineStatus.failed) log.error(`Argo pipeline failed for project ${project.name}`);
    //   }
    //
    //   // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/maro/-/issues/59]: clone only deploy repo created
    //   await glab.cloneGroupOrProject(deploy_id, deploy_path);
    //   const { deploy_repo } = await getApp(name);
    //   if (!deploy_repo) return log.error("Could not find deploy repo");
    //
    //   await deploy_repo.deploy(projects_to_deploy.map((p) => ({ name: p.name, configmaps: [], secrets: [] })), initial_version);
    //   const sync_pipeline = await findSyncPipeline(app_repo);
    //   if (!sync_pipeline) return log.error("Could not find sync pipeline");
    //   const cd_status = await waitForPipeline(sync_pipeline);
    //   if (cd_status === PipelineStatus.failed) return log.error("CI pipeline failed");
    //
    //   if (type === "fcd") {
    //     // TODO [https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/maro/-/issues/73]: expose in 3scale
    //   }
    //
    //   log.success(`New app ${name} created successfully`);
    // }
  }
};
