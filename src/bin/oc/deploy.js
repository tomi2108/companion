#!/usr/bin/env node

import { executeScript } from "../../lib/cmd.js";
import fzf from "node-fzf";
import { config } from "../../lib/config.js";
import Enquirer from "enquirer";
import fs from "node:fs";
import path from "node:path";

const { input } = Enquirer;

(async () => {
  const basePath = config.paths.oc;
  const envList = await fzf({ list: ["dev", "int", "cert"] });

  if (!envList.selected) return process.exit(1);
  const { value: env } = envList.selected;

  const apps = fs.readdirSync(basePath);
  const appList = await fzf({ list: apps });

  if (!appList.selected) return process.exit(1);
  const { value: app } = appList.selected;

  // TODO: maybe search for the repository in
  // config.paths.mf and config.paths.ms
  // and show available tags to the user
  const version = await input({
    message: "Enter version"
  });

  executeScript("oc/deploy", {
    args: [env, path.resolve(basePath, app), version]
  });
})();

