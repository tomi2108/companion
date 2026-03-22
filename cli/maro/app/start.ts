import chalk from "chalk";

import { AppRepo } from "@interface/dirs/app_repo";
import { Command } from "@lib/index";
import { removeDuplicatesByKey } from "@lib/utils";
import { AppStart } from "@workflow/steps/app/AppStart";
import { AppStartProxy } from "@workflow/steps/app/AppStartProxy";
import { GetSubApps } from "@workflow/steps/app/GetSubApps";
import { PromptPaths } from "@workflow/steps/app/PromptPaths";
import { ForEach } from "@workflow/steps/flow/ForEach";
import { Write } from "@workflow/steps/flow/Write";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { PromptOcServer } from "@workflow/steps/oc/servers/PromptOcServer";
import { Workflow } from "@workflow/workflow";

const StartCommand: Command = {
  name: "start",
  aliases: [],
  description: "Start app and all sub-apps locally",
  options: [
    {
      name: "raw",
      type: "boolean",
      description: "Whether to show raw logs, by default logs are formatted as JSON, and every line which is not valid JSON is omitted from logs",
      aliases: ["r"]
    }
  ],
  run: async ({ ctx, args }) => {
    const colors = [
      chalk.blue,
      chalk.red,
      chalk.yellow,
      chalk.magenta,
      chalk.green,
      chalk.cyan
    ];
    const proxy_port = 8080;
    const { raw } = args || {};

    await new Workflow([
      new PromptOcServer(),
      new PromptOcProject(),
      new PromptPaths({
        paths: ["backend"],
        multiple: true,
        transform: ({ paths }) => ({ app_repos: paths.map((p) => new AppRepo(p)) })
      }),
      new ForEach({
        item: "app_repo",
        items: (state: { app_repos: AppRepo[] }) => state.app_repos,
        step: new GetSubApps({ include_initial: true, reuse: true }),
        collectAs: "app_repos",
        transform: ({ app_repos }) => ({
          apps: removeDuplicatesByKey(
            app_repos.flatMap((r) => r.sub_apps),
            (r) => r.dir.path
          )
        })
      }),
      new ForEach({
        item: "app_repo",
        items: (state: { sub_apps: AppRepo[] }) => state.sub_apps,
        step: (i) =>
          new Workflow([
            new AppStart({
              port: proxy_port + 1 + i,
              raw,
              color: colors[i % colors.length]
            }),
            new Write({ write: (state: { app_repo: AppRepo }) => ({ app: state.app_repo, port: proxy_port + 1 + i }) })
          ]),
        collectAs: "apps"
      }),
      new AppStartProxy({ port: proxy_port })
    ]).run(ctx);
  }
};

export default StartCommand;
