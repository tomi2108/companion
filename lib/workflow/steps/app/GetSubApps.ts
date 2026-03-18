import { getPaths } from "@files";
import { AppRepo } from "@interface/dirs/app_repo";
import { ExecutionContext } from "@lib/ctx";
import { loading } from "@lib/decorators/ui";
import { Project } from "@oc/project";

import { WorkflowOptions, WorkflowStep } from "..";
import { GetDeployRepo } from "./GetDeployRepo";
import { CopyEnv } from "../env/CopyEnv";

type Reads = {
  app_repo: AppRepo;
  project: Project;
  sub_apps?: AppRepo[];
};
type Writes = { sub_apps: AppRepo[] };
type Options = {
  include_initial?: boolean;
  reuse?: boolean;
  depth?: number;
};

export class GetSubApps extends WorkflowStep<Reads, Writes> {

  constructor(override options?: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  @loading("Getting sub apps")
  async run(ctx: ExecutionContext, { app_repo, project, ...state }: Reads) {
    const backend = getPaths("backend");
    const apps = backend.map((b) => new AppRepo(b));
    const sub_apps: AppRepo[] = this.options?.reuse ? state.sub_apps ?? [] : [];
    const depth = this.options?.depth;

    if (this.options?.include_initial) sub_apps.push(app_repo);

    async function getSubApps(repo: AppRepo, currentDepth: number): Promise<void> {
      if (depth !== undefined && currentDepth >= depth) return;

      const { name: app } = await repo.getInfo();
      const env = repo.env;

      await new CopyEnv().run(ctx, { app_repo: repo, project });
      env.internal();

      const { deploy_repo } = await new GetDeployRepo().run(ctx, { app_repo: repo });
      const deployment = deploy_repo?.getDeployment(project.name);
      const version = deployment?.getVersion();

      if (!version) throw new Error(`Version not found for ${app} in project ${project.name}`);

      await repo.checkout(version);

      const envEntries = Object.entries(env.read());

      for (const [_, value] of envEntries) {
        if (typeof value !== "string") continue;

        const host = URL.canParse(value) ? new URL(value).hostname : null;
        if (!host) continue;

        const sub_app_name = host.split(".")[0];

        const found = await Promise.all(
          apps.map(async (a) => {
            const { name } = await a.getInfo();
            return sub_app_name === name;
          })
        );

        const foundIndex = found.findIndex(Boolean);
        if (foundIndex === -1) continue;

        const sub_app = apps[foundIndex]!;
        const already_added = sub_apps.some((r) => r.dir.path === sub_app.dir.path);
        if (already_added) continue;

        const sub_app_repo = new AppRepo(sub_app.dir);

        sub_apps.push(sub_app_repo);

        await getSubApps(sub_app_repo, currentDepth + 1);
      }
    }

    await getSubApps(app_repo, 0);
    return { sub_apps };
  }
}
