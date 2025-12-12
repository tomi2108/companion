import fs from "node:fs";
import path from "node:path";

import { getApp, getSubApps } from "@files";
import { getAppCollections } from "@files/http";
import { MonitorYaml } from "@files/monitor_yaml";
import { createDirIfNotExists } from "@files/utils";
import { Repo } from "@interface/dirs/repo";
import { HttpFile } from "@interface/http/http_file";
import { promptForOcResource } from "@interface/prompts";
import { Config, ConfigError } from "@lib/config";
import log from "@lib/log";
import { confirm, input, search } from "@lib/ui";
import { toYaml } from "@lib/utils";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";

import { createMonitorIssue } from "./doc";

export default {
  command: "new",
  aliases: ["n"],
  describe: "Create new monitor yaml",
  handler: async () => {
    const config = Config.get();
    const monitors_path = config.paths.monitors;
    if (!monitors_path) throw new ConfigError("paths.monitors");
    const http_files = getAppCollections();
    const projects = await new Openshift(await getOcToken()).getProjects();
    const project = await promptForOcResource(projects);
    const name = await input({ message: "User flow name" });
    const services_doc_link = await input({ message: "Services documentation url" });
    const choices = http_files
      .map((f) => f.service)
      .filter((s) => s !== null);
    const app = await search({ choices: [...choices], message: "Initial service" });
    const subapps = await getSubApps(app, choices, project);
    const apps = [app];
    if (subapps) apps.push(...subapps);
    const files = apps.map((a) => http_files.find((f) => f.service === a)).filter((f) => f !== undefined);
    const to_prompt = (await Promise.all(files.map(getService))).filter((s) => s !== undefined);

    const services = [];
    for (const service of to_prompt) {
      const choices = service.routes.map((r) => `${r.method} ${r.endpoint}`);
      const reqs = await search({ multiple: true, choices, message: `Choose routes for ${service.name}` });
      const chosen_routes = reqs.map((r) => {
        const [method, endpoint] = r.split(" ");
        const found = service.routes.find((r) => r.method === method && r.endpoint === endpoint);
        return found;
      }).filter((r) => r !== undefined);
      if (chosen_routes.length === 0) continue;
      services.push({ ...service, routes: chosen_routes });
    }

    const res = {
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

    const content = toYaml(res);
    const file_name = `${res.name}_${res.date}.yaml`;
    const dir = path.join(monitors_path, project.name);
    const full_path = path.join(dir, file_name);

    const createIssue = await confirm({ message: "Create jira ticket?" });
    if (createIssue) {
      const project_key = config.jira.monitors_project_key;
      const parent_issue_key = config.jira.monitors_parent_issue_key;

      if (!project_key) throw new ConfigError("jira.monitors_project_key");
      if (!parent_issue_key) throw new ConfigError("jira.monitors_parent_issue_key");
      await createMonitorIssue(new MonitorYaml(full_path), { parent_issue_key, project_key });
    }

    const repo = new Repo(monitors_path);
    await repo.stash(async () => {
      await repo.switchBranchIfExists("master");
      await repo.update();
      createDirIfNotExists(dir);
      fs.writeFileSync(full_path, content);
      log.success(`Created ${full_path}`);
      await repo.add(full_path);
      await repo.commit(`monitor: ${res.name}`);
      await repo.push("master");
    });
  }
};

async function getService(f: HttpFile) {
  const name = f.service;
  const { app_repo } = await getApp(f.service);
  if (!app_repo) return log.error(`Could not find app_repo for service ${name}`);

  const description = app_repo.description;
  const type = (await app_repo.getInfo()).type;
  const routes = f.requests
    .filter((r) => r.pathname !== "/health")
    .map((req) => ({
      endpoint: req.pathname,
      method: req.method
    }));

  return { name, type, routes, description };
}
