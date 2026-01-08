import { CronYaml } from "@files/cron_yaml";
import { Dir } from "@files/dir";
import { ExecutionContext } from "@lib/ctx";
import { Project } from "@oc/project";

import { WorkflowStep } from "../..";

type Writes = { cron: CronYaml };
type Reads = { project: Project };
type Options = {};

export class PromptCron extends WorkflowStep<Reads, Writes, Options> {
  async run(ctx: ExecutionContext, { project }: Reads) {
    const namespaces_path = ctx.config.paths.namespaces!;
    const namespaces = new Dir(namespaces_path);
    const namespace_repo = namespaces.sub(project.name);
    const templates = namespace_repo.sub("templates");
    const cron_jobs = templates.readFiles().filter(CronYaml.isCronYaml);
    const cron_job = await ctx.ui.promptChoice(cron_jobs, { message: "Select cronjob" });
    const file = new CronYaml(cron_job.path);
    return { cron: file };
  }
}
