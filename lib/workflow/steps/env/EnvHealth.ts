import { AppRepo } from "@interface/dirs/app_repo";
import { DeployRepo } from "@interface/dirs/deploy_repo";
import { ExecutionContext } from "@lib/ctx";
import { Deployment } from "@oc/deployment";
import { Project } from "@oc/project";

import { WorkflowStep } from "..";

type Reads = {
  project: Project;
  deployment: Deployment;
  deploy_repo: DeployRepo;
  app_repo: AppRepo;
};

export class EnvHealth extends WorkflowStep<Reads> {
  async run(ctx: ExecutionContext, {
    deployment,
    project,
    app_repo,
    deploy_repo
  }: Reads) {
    const deployment_file = deploy_repo.getDeployment(project.name);
    const version = deployment_file?.getVersion();
    const log = ctx.logger;
    const config = ctx.config;

    if (!version) {
      log.warning(`Could not find version for ${deployment.name}`);
      return {};
    }
    const active_branch = await app_repo.getActiveBranch();
    await app_repo.checkout(version);
    const env_file_path = config.repos.environment_path ?? "src/configuration/environment.ts";
    const env_file = app_repo.dir.getFile(env_file_path);
    if (!env_file.exists()) {
      log.warning(`Could not find env file for ${deployment.name}`);
      return {};
    }

    const configMaps = await deployment.getConfigMaps() ?? [];
    const secrets = deployment.getSecrets() ?? [];
    const resources = await Promise.all([...secrets, ...configMaps].map((r) => r.getData()));
    const env = resources.filter((r) => r !== undefined).reduce((acc, curr) => ({ ...acc, ...curr }));
    const matches = env_file.read().matchAll(/process\.env\..*/g).toArray().map((m) => m[0].replace("process.env.", ""));
    const envs_exclusions = Config.get().envs.health_exclusions ?? [];
    const keys = matches
      .map((m) => m.split(" ")?.[0]?.replaceAll(",", "") ?? "")
      .filter((k) => !envs_exclusions.includes(k));

    const table = new Table({
      head: [deployment.name, "Status"],
      style: { compact: true },
      colWidths: [50]
    });

    for (const key of keys) {
      if (!env[key]) table.push([key, chalk.red(status.MISSING)]);
    }

    for (const key of Object.keys(env).filter((k) => !envs_exclusions.includes(k))) {
      if (!keys.includes(key)) table.push([key, chalk.yellow(status.UNUSED)]);
    }

    app_repo.switchBranchIfExists(active_branch);

    if (table.length > 0) console.log(table.toString());
    return {};
  }
}
