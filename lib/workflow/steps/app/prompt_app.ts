import { Dir } from "@files/dir";
import { AppRepo } from "@interface/dirs/app_repo";
import { DeployRepo } from "@interface/dirs/deploy_repo";
import { ConfigError } from "@lib/config";
import { ExecutionContext } from "@lib/ctx";
import { loading, search } from "@lib/ui";

import { WorkflowStep } from "..";
import { GetApp } from "./get_app";

type Reads = {};
type Writes = { deploy_repo: DeployRepo; app_repo: AppRepo | null };

export class PromptApp implements WorkflowStep<Reads, Writes> {

  async run(ctx: ExecutionContext) {
    const dep_path = ctx.config.paths.despliegues;
    if (!dep_path) throw new ConfigError("paths.despliegues");
    const apps = new Dir(dep_path).readDirs();
    const app_name = await search({
      choices: apps.map((a) => a.toChoice()),
      message: ""
    });
    // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/companion/-/issues/38]: can maybe improve this, not searching by app_name, but by origin url ?
    // think more about this
    const spinner = loading("Getting app");
    const app = await new GetApp().run(ctx, app_name);
    console.log(app);
    process.exit(1);
    spinner.succeed();
    return app as { deploy_repo: DeployRepo; app_repo: AppRepo | null };
  }
}
