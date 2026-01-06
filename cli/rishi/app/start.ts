import chalk from "chalk";
import httpProxy from "http-proxy";
import { ChildProcessWithoutNullStreams } from "node:child_process";
import http from "node:http";
import { Argv } from "yargs";

import { Dir } from "@files/dir";
import { AppRepo } from "@interface/dirs/app_repo";
import { Config } from "@lib/config";
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
    const backend_path = Config.get().paths.backend ?? "";
    if (!backend_path) return log.error("Backend path not set");

    const projects = await new Openshift(await getOcToken()).getProjects();
    const project = await promptChoice(projects);

    const backend = new Dir(backend_path);
    const apps = backend.readDirs() ?? [];
    const choices = apps.map((d) => d.toChoice());
    const selected_apps = await search({ choices, message: "Choose app", multiple: true });

    const proxy_port = 8080;
    const port = 8081;
    const toStart = Object.fromEntries(selected_apps.map((a, i) => [a, port + i]));

    for (const app of selected_apps) {
      await getSubApps(
        app,
        apps.map((a) => a.name()),
        project,
        ({ key, app_repo, already_added, name }) => {
          const env = app_repo.env;
          if (Object.keys(toStart).includes(name)) return;
          if (!noedit) env.remove(key);
          if (!already_added) {
            const next_port = port + Object.values(toStart).length;
            toStart[name] = next_port;
            if (!noedit) env.add(key, `http://localhost:${next_port}`);
          } else if (!noedit) env.add(key, `http://localhost:${toStart[name]}`);
        });
    }

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
      const repo = new AppRepo(backend);
      await repo.install();
      const color = colors[i % colors.length];
      const { promise, process } = repo.dev(port, { raw, prefix: color?.(app) });
      children.push(process);
      await promise;
    });

    const proxy = httpProxy.createProxyServer({});
    http.createServer((req, res) => {
      for (const [name, port] of Object.entries(toStart)) {
        if (req.url?.includes(name)) {
          const new_url = `/${req.url.split("/").slice(2).join("/")}`;
          req.url = new_url;
          proxy.web(req, res, { target: `http://localhost:${port}` });
          return;
        }
      }
      res.statusCode = 404;
      res.end();
    }).listen(proxy_port);

    try {
      console.log(toStart);
      await Promise.all(promises);
    } catch (err) {
      console.error(err);
      children.forEach((c) => c.kill("SIGTERM"));
    }
  }
};
