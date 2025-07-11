import { getOcToken, Openshift } from "../../../interface/oc/oc";
import { promptForOcResource } from "../../../interface/prompts";
import { Config } from "../../../lib/config";
import log from "../../../lib/log";
import path from "node:path";
import { search } from "../../../lib/ui";
import { readdirs } from "../../../lib/utils";
import { AppRepo } from "../../../interface/files/app_repo";
import chalk from "chalk";
import { ChildProcessWithoutNullStreams } from "node:child_process";
import { Argv } from "yargs";

export default {
  command: "start",
  aliases: [],
  describe: "Start app and all sub-apps locally",
  builder: (yargs: Argv) => yargs
    .boolean("raw")
    .alias("raw", ["r"])
    .describe("raw", "Whether to show raw logs, by default logs are formatted as JSON, and every line which is not valid JSON is omitted from logs"),
  handler: async ({ raw }: { raw?: boolean }) => {
    const backend = Config.get().paths.backend ?? "";
    if (!backend) {
      log.error("Backend path not set");
      return process.exit(1);
    }

    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects);

    const apps = readdirs(backend) ?? [];
    const choices = apps.map((d) => d.name);
    const app = await search({ choices, message: "Choose app" });

    const port = 8080;
    const toStart = { [app]: port };

    async function getEnv(app: string) {
      const repo = new AppRepo(path.join(backend, app));
      try {
        await repo.copyEnv(project);
        await repo.switchBranchIfExists("master");
        await repo.pull("master");
      } catch (err) {
        log.error(`Could not start ${app}`);
        if (err instanceof Error) log.error(err.message);
        process.exit(1);
      }

      const env = repo.getEnv();
      const children = Object.entries(env).map(async ([key, value]) => {
        const choices = apps.map((d) => d.name);
        const host = URL.canParse(value) ? new URL(value).hostname : null;
        if (!host) return;
        const found = choices.find((c) => host.split(".")[0] === c);
        if (!found) return;
        const already_added = toStart[found];
        repo.removeEnv(key);
        if (!already_added) {
          const next_port = port + Object.values(toStart).length;
          toStart[found] = next_port;
          repo.addEnv(key, `http://localhost:${next_port}`);
          await getEnv(found);
        } else repo.addEnv(key, `http://localhost:${already_added}`);
      });
      await Promise.all(children);
    }

    await getEnv(app);
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
      const { promise, process } = repo.dev(port, { raw, prefix: color?.(app)});
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
