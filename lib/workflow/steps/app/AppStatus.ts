import { Issue } from "sonarqube-web-api-client";

import { AppRepo } from "@interface/dirs/app_repo";
import { DeployRepo } from "@interface/dirs/deploy_repo";
import { SonarQube } from "@interface/sonar";
import { ExecutionContext } from "@lib/ctx";
import { Project } from "@oc/project";

import { WorkflowStep } from "..";

type Reads = {
  app_repo: AppRepo;
  deploy_repo?: DeployRepo;
  project: Project;
};
type Writes = {
  name: string;
  current_version: string;
  last_version: string;
  updated: string;
  mocked: string;
  todos: Issue[];
};

export class AppStatus extends WorkflowStep<Reads, Writes> {

  async run(ctx: ExecutionContext, { app_repo, deploy_repo, project }: Reads) {
    const sonar = new SonarQube();
    const sonar_projects = await sonar.getProjects();
    const { name } = await app_repo.getInfo();
    const deployment = await project.getDeployment(name).catch(() => null);
    const secrets = deployment?.getSecrets() ?? null;

    const [last, current] = await Promise.all([
      (async () => {
        // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/maro/-/issues/76]: for frontend repos look at -beta... -rc based on project
        await app_repo.update();
        return (await app_repo.getTags())?.[0];
      })(),
      (async () => {
        if (!deployment || !deploy_repo) return;
        await deploy_repo.update();
        const deployment_file = deploy_repo.getDeployment(project.name);
        if (!deployment_file) return;
        return deployment_file.getVersion();
      })()
    ]);
    const sonar_project = sonar_projects.find((p) => p.key.includes(name));
    const todos = (await sonar.getCodeSmells(sonar_project.key)).filter((i) => i.message.includes("TODO"));

    const isUpdated = current && last ? current === last : null;
    const current_version = current ?? "-";
    const last_version = last ?? "-";
    const updated = (() => {
      if (isUpdated === null) return "-";
      if (isUpdated) return "yes";
      return "no";
    })();

    const mockSecrets = ctx.config.openshift.mock_secrets ?? [];

    const mocked = (() => {
      if (secrets === null) return "-";
      if (secrets.some((s) => mockSecrets.includes(s.name))) return "yes";
      return "no";
    })();

    return { name, current_version, last_version, updated, mocked, todos };
  }
}
