import { Dir } from "@files/dir";
import { HttpMethod } from "@files/formatters/http_formatter";
import { MonitorYaml } from "@files/monitor_yaml";
import { Repo } from "@interface/dirs/repo";
import { AppType } from "@lib/constants";
import { ExecutionContext } from "@lib/ctx";
import { Project } from "@oc/project";

import { WorkflowStep } from "..";
import { ValidateConfig } from "../config/ValidateConfig";

type Reads = {
  project: Project;
  name: string;
  services_doc_link: string;
  services: {
    routes: { method: HttpMethod; endpoint: string }[];
    name: string;
    description: string;
    type: AppType;
  }[];
};
type Writes = { monitor_file: MonitorYaml };
type Options = {};

export class CreateMonitorFile extends WorkflowStep<Reads, Writes, Options> {
  async run(ctx: ExecutionContext, {
    services_doc_link,
    project,
    name,
    services
  }: Reads) {
    new ValidateConfig({ keys: ["paths.rest"] }).run(ctx);
    const log = ctx.logger;
    const content = {
      name,
      namespace: project.name,
      services_doc_link,
      date: new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }).format(new Date()).replaceAll("/", "-"),
      services
    };

    const file_name = `${content.name}_${content.date}.yaml`;
    const monitors_path = ctx.config.paths.monitors!;
    const monitors_dir = new Dir(monitors_path);
    const namespace_dir = monitors_dir.sub(project.name);
    const monitor_file = new MonitorYaml(namespace_dir.createFile(file_name).path);

    const repo = new Repo(monitors_dir);
    await repo.stash(async () => {
      await repo.switchBranchIfExists("master");
      await repo.update();

      monitors_dir.create();
      monitor_file.write(content);
      log.success(`Created ${monitor_file.path}`);
      await repo.add(monitor_file);
      await repo.commit(`monitor: ${monitor_file.read().name}`);
      await repo.push("master");
    });
    return { monitor_file };
  }
}
