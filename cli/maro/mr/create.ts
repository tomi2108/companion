import { Repo } from "@interface/dirs/repo";
import { Command } from "@lib/index";
import { If } from "@steps/flow/If";
import { Write } from "@steps/flow/Write";
import { PromptBranch } from "@steps/git/PromptBranches";
import { CreateMr } from "@steps/mr/CreateMr";
import { CreateAndMergeMr } from "@workflow/steps/mr/CreateAndMergeMr";
import { Workflow } from "@workflow/workflow";

const CreateCommand: Command = {
  name: "create",
  aliases: [],
  description: "Create and merge mr",
  run: async ({ ctx }) => {
    const repo = new Repo(ctx.cwd);
    await new Workflow([
      new Write({
        write: async () => ({
          repo: new Repo(ctx.cwd),
          source_branch: await repo.getActiveBranch()
        })
      }),
      new PromptBranch({
        transform: ({ branch }) => ({ target_branch: branch })
      }),
      new If({
        condition: () => ctx.ui.confirm({ message: "Merge?" }),
        then: new CreateAndMergeMr(),
        else: new CreateMr()
      })
    ]).run(ctx);

    // TODO(20260318-002414): maybe when waiting for pipelines works properly we can implement this
    //   const { name } = await repo.getInfo();
    //   const { deploy_repo, app_repo } = await getApp(name);
    //   if (merge && AppRepo.isAppRepo(dir)) {
    //     deploys = await confirm({ message: "Deploy?" });
    //     if (deploys) {
    //       const token = await getOcToken();
    //       const projects = await new Openshift(token).getProjects();
    //       deploy_projects = await promptChoice(projects, { message: "Choose projects", multiple: true });
    //     }
    //   }
    //
    //   if (!merge) {
    //     const spinner = loading("Building merge request");
    //     const mr = await repo.createMr(targetBranch, { reviewer: add_reviewer ? default_reviewer : undefined });
    //     spinner.succeed();
    //     const open = await confirm({ message: `Open ${mr.title} in browser?` });
    //     if (open) return mr.openInBrowser();
    //   }
    //
    //   await repo.createAndMergeMr(targetBranch);
    //
    //   if (!deploys || !app_repo || !deploy_repo || deploy_projects?.length === 0) return;
    //
    //   const pipeline = await findCIPipeline(app_repo);
    //   if (!pipeline) return log.error("Could not find ci pipeline");
    //   const status = await waitForPipeline(pipeline, "Running CI pipeline");
    //   if (status === PipelineStatus.failed) process.exit(1);
    //
    //   await app_repo?.update();
    //   const tags = await app_repo.getTags({ sortByLastCreated: true });
    //   const last_version = tags?.[0];
    //   if (!tags || !last_version) return log.error("Could not find version to deploy");
    //
    //   deploy_repo.deploy(deploy_projects.map((p) => ({ configmaps: [], secrets: [], name: p.name })), last_version);
    // }
  }
};

export default CreateCommand;