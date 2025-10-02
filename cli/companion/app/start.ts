import chalk from "chalk";
import { ChildProcessWithoutNullStreams } from "node:child_process";
import path from "node:path";
import { Argv } from "yargs";

import { getSubApps } from "@files";
import { AppRepo } from "@files/app_repo";
import { promptForOcResource } from "@interface/prompts";
import { Config } from "@lib/config";
import log from "@lib/log";
import { search } from "@lib/ui";
import { readdirs } from "@lib/utils";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";

export default {
  command: "start",
  aliases: [],
  describe: "Start app and all sub-apps locally",
  builder: (yargs: Argv) => yargs
    .boolean("raw")
    .alias("raw", ["r"])
    .describe("raw", "Whether to show raw logs, by default logs are formatted as JSON, and every line which is not valid JSON is omitted from logs")
    .boolean("noedit")
    .alias("noedit", ["ne"])
    .describe("noedit", "Do not start apps nor edit files, only show list"),
  handler: async ({ raw, noedit }: { raw?: boolean; noedit?: boolean }) => {
    const backend = Config.get().paths.backend ?? "";
    if (!backend) return log.error("Backend path not set");

    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects);

    const apps = readdirs(backend) ?? [];
    const choices = apps.map((d) => d.name);
    const app = await search({ choices, message: "Choose app" });

    const port = 8080;
    const toStart = { [app]: port };
    await getSubApps(
      app,
      apps.map((a) => a.name),
      project,
      ({ key, app_repo, already_added, name }) => {
        if (!noedit) app_repo.removeEnv(key);
        if (!already_added) {
          const next_port = port + Object.values(toStart).length;
          toStart[name] = next_port;
          if (!noedit) app_repo.addEnv(key, `http://localhost:${next_port}`);
        } else if (!noedit) app_repo.addEnv(key, `http://localhost:${toStart[name]}`);
      });

    if (noedit) return console.log(toStart);
    const colors = [
      chalk.blue,
      chalk.red,
      chalk.yellow,
      chalk.magenta,
      chalk.green,
      chalk.cyan
    ];

    const children: ChildProcessWithoutNullStreams[] = [];
    const promises = Object.entries(toStart).map(async ([app, port], i) => {
      const repo = new AppRepo(path.join(backend, app));
      await repo.install();
      const color = colors[i % colors.length];
      const { promise, process } = repo.dev(port, { raw, prefix: color?.(app) });
      children.push(process);
      await promise;
    });

    try {
      console.log(toStart);
      await Promise.all(promises);
    } catch (err) {
      console.error(err);
      children.forEach((c) => c.kill("SIGTERM"));
    }
  }
};
