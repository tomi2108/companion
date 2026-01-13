import { AppRepo } from "@interface/dirs/app_repo";
import { HttpFile } from "@interface/http/http_file";
import { Req } from "@interface/http/req";
import { Config, ConfigError } from "@lib/config";
import { ExecutionContext } from "@lib/ctx";
import { GetAppRepo } from "@workflow/steps/app/GetAppRepo";
import { GetSubApps } from "@workflow/steps/app/GetSubApps";
import { ForEach } from "@workflow/steps/flow/ForEach";
import { If } from "@workflow/steps/flow/If";
import { Write } from "@workflow/steps/flow/Write";
import { GetHttpFile } from "@workflow/steps/http/GetHttpFile";
import { PromptHttpFile } from "@workflow/steps/http/PromptHttpFile";
import { PromptHttpFileRequest } from "@workflow/steps/http/PromptHttpFileRequest";
import { CreateMonitorFile } from "@workflow/steps/monitor/CreateMonitorFile";
import { CreateMonitorIssue } from "@workflow/steps/monitor/CreateMonitorIssue";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { Input } from "@workflow/steps/ui/Input";
import { Workflow } from "@workflow/workflow";

export default {
  command: "create",
  aliases: ["c"],
  describe: "Create new monitor yaml",
  handler: async () => {
    const config = Config.get();
    const monitors_path = config.paths.monitors;
    if (!monitors_path) throw new ConfigError("paths.monitors");
    const ctx = ExecutionContext.get();
    await new Workflow([
      new PromptOcProject({ server: "cuyo" }),
      new Input({ write: "name", message: "User flow name" }),
      new Input({ write: "services_doc_link", message: "Services documentation url" }),
      new PromptHttpFile(),
      new Write({ write: (state: { http_file: HttpFile }) => ({ app_name: state.http_file.service }) }),
      new GetAppRepo(),
      new GetSubApps({ include_initial: true }),
      new ForEach({
        item: "app_repo",
        items: (state: { sub_apps: AppRepo[] }) => state.sub_apps,
        step: new Workflow([
          new GetHttpFile(),
          new PromptHttpFileRequest({ multiple: true })
        ])
      }),
      new Write({
        write: async (state: {
          app_repo: AppRepo;
          requests: Req[];
        }) => {
          const { type, name } = await state.app_repo.getInfo();
          const description = state.app_repo.package.read().description;
          return {
            services: state.requests.map((s) => ({ routes: s, name, description, type }))
          };
        }
      }),
      new CreateMonitorFile(),
      new If({
        condition: async () => await ctx.ui.confirm({ message: "Create jira ticket?" }),
        then: new CreateMonitorIssue()
      })
    ]).run(ctx);
  }
};
