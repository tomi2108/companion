import chalk from "chalk";
import path from "node:path";
import yargs from "yargs";

import { AppRepo } from "@files/app_repo";
import { Config } from "@lib/config";
import { storage } from "@lib/log";

export async function loadConfig({ prod }: { prod?: boolean }) {
  await Config.get().load();
  if (prod) {
    Config.get().openshift.server_name = "ocpprod";
    Config.get().openshift.server_cuyo = "api.ocpprod.cuyorh.tcloud.ar:6443";
    Config.get().openshift.auth_server_cuyo = "https://oauth-openshift.apps.ocpprod.cuyorh.tcloud.ar";
  }
}

export async function initLogger({ $0, _: args, debug }: yargs.ArgumentsCamelCase<{ debug: boolean | undefined }>
) {
  const command = `${$0} ${args.join(" ")}`;
  const startTime = new Date().getTime();
  storage.enterWith({ command, startTime, debug: debug ?? false });
}

export async function checkVersion() {
  const repo = new AppRepo(path.resolve(__dirname, "../../"));
  const current_version = repo.version;
  const release = await repo.getLatestRelease();
  const remote_version = release.name;
  if (current_version !== remote_version) {
    console.log("New version", chalk.green(`v${remote_version}`), "is available!, You are using", chalk.red(`v${current_version}`));
    console.log("Upgrade now with: companion upgrade");
  }
}
