import { Repo } from "@interface/dirs/repo";
import { Command } from "@lib/index";
import { Write } from "@steps/flow/Write";
import { MergeMr } from "@steps/mr/MergeMr";
import { PromptMr } from "@steps/mr/PromptMr";
import { Workflow } from "@workflow/workflow";

const MergeCommand: Command = {
  name: "merge",
  aliases: [],
  description: "Merge merge request",
  run: async ({ ctx }) => {
    await new Workflow([
      new Write({
        write: () => ({ repo: new Repo(ctx.cwd) })
      }),
      new PromptMr(),
      new MergeMr()
    ]).run(ctx);
    // TODO(20260318-00245): Once waiting for pipelines works
    //
    // const { name } = await repo.getInfo();
    // const { deploy_repo, app_repo } = await getApp(name);
    // let deploys = false;
    // let deploy_projects: Project[] = [];
    //
    // if (app_repo && deploy_repo) {
    //   deploys = await confirm({ message: "Deploy?" });
    //   if (deploys) {
    //     const token = await getOcToken();
    //     const projects = await new Openshift(token).getProjects();
    //     deploy_projects = await promptChoice(projects, { message: "Choose projects", multiple: true });
    //   }
    // }
    // if (!deploys || !app_repo || !deploy_repo || deploy_projects?.length === 0) return;
    // const pipeline = await findCIPipeline(app_repo);
    // if (!pipeline) return log.error("Could not find ci pipeline");
    //
    // const status = await waitForPipeline(pipeline, "Running CI pipeline");
    // if (status === PipelineStatus.failed) process.exit(1);
    //
    // await app_repo?.update();
    // const last_version = (await app_repo.getTags({ sortByLastCreated: true }))?.[0];
    // if (!last_version) return log.error("Could not find version to deploy");
    // deploy_repo.deploy(deploy_projects.map((p) => ({ configmaps: [], secrets: [], name: p.name })), last_version);
  }
};

export default MergeCommand;