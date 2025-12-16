import { getPath } from "@files";
import { ThreescaleYaml } from "@files/threescale_yaml";
import { AppRepo } from "@interface/dirs/app_repo";
import { Repo } from "@interface/dirs/repo";
import { Config, ConfigError } from "@lib/config";
import { ExecutionContext } from "@lib/ctx";
import { search } from "@lib/ui";
import { Deployment } from "@oc/deployment";
import { Project } from "@oc/project";

import { WorkflowStep } from "..";

type Reads = {
  app_repo: AppRepo;
  deployment: Deployment;
  project: Project;
};

const availabe_methods = ["GET", "POST"];
export class ExposeApp extends WorkflowStep<Reads> {

  async run(ctx: ExecutionContext, { app_repo, deployment, project }: Reads) {
    const logger = ctx.logger;
    const namespace = project.name;
    const system_name = Config.get().threescale.products?.[namespace];
    if (!system_name) throw new ConfigError(`threescale.products.${namespace}`);

    const threescale = getPath("threescale");
    const repo = new Repo(threescale);

    const dir_name = `${deployment.name}-${namespace}`;
    const file_name = `${dir_name}.yaml`;

    const dir = threescale.sub(dir_name);
    const file = new ThreescaleYaml(dir.createFile(file_name).path);

    const methods = await search({ choices: availabe_methods, message: "Select methods", multiple: true });

    const description = app_repo.package.read().description ?? "";
    if (!description) logger.warning("Could not find app_repo, using empty description");

    await repo.stash(async () => {
      await repo.switchBranchIfExists("create");
      await repo.update();
      const new_branch = `feature/create/${dir_name}`;

      const branches = await repo.getBranches();
      if (branches.includes(new_branch)) await repo.deleteBranch(new_branch);
      await repo.createNewBranch(new_branch);

      dir.create();
      file.init();
      file.setMethods(methods);
      file.setName(dir_name);
      file.setSystemName(system_name);
      file.setDeployment(deployment.name);
      file.setNamespace(namespace);
      file.setDescription(description);
      await repo.add(file);
      await repo.commit(`create ${dir_name}`);
      await repo.createAndMergeMr("create");
      await repo.switchBranchIfExists("create");
      await repo.deleteBranch(new_branch);
    });
    return {};
  }
}
