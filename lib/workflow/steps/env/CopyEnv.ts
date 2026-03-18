import { AppRepo } from "@interface/dirs/app_repo";
import { ExecutionContext } from "@lib/ctx";
import { Project } from "@oc/project";

import { WorkflowStep } from "..";

type Reads = {
  app_repo: AppRepo;
  project: Project;
};

export class CopyEnv extends WorkflowStep<Reads> {
  async run(_: ExecutionContext, { app_repo, project }: Reads) {
    const { name } = await app_repo.getInfo();
    const deployment = await project.getDeployment(name);
    const configMaps = await deployment.getConfigMaps() ?? [];
    const secrets = deployment.getSecrets() ?? [];
    const env = app_repo.env;
    env.delete();

    for (const r of [...secrets, ...configMaps]) {
      for (const [key, value] of Object.entries(await r.getData() ?? {})) {
        env.add(key, value);
      }
    }

    const extraEnvs = {
      STDOUT_LOGS: "on"
    };

    Object.entries(extraEnvs).forEach(([key, value]) => {
      env.remove(key);
      env.add(key, value);
    });
    env.external();
    return {};
  }
}
