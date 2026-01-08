import chalk from "chalk";
import path from "node:path";

import { Dir } from "@files/dir";
import { AppRepo } from "@interface/dirs/app_repo";
import { ExecutionContext } from "@lib/ctx";

export async function loadExecutionContext({ prod, debug }: { prod?: boolean; debug?: boolean }) {
  const ctx = ExecutionContext.get();
  await ctx.load();
  if (prod) await ctx.setProd();
  if (debug) ctx.setDebug();
}

export async function checkVersion() {
  const root = path.resolve(__dirname, "../../");
  const repo = new AppRepo(new Dir(root));
  const current_version = repo.getPackage().version;
  repo.getLatestRelease().then((release) => {
    const remote_version = release.name;
    if (current_version !== remote_version) {
      console.log("New version", chalk.green(`v${remote_version}`), "is available!, You are using", chalk.red(`v${current_version}`));
      console.log("Upgrade now with: clair upgrade");
    }
    return;
  }).catch(() => { });
}
