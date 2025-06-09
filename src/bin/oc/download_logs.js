#!/usr/bin/env node

import { clearConsole, executeScript } from "../../lib/cmd.js";
import fzf from "node-fzf";
import { config } from "../../lib/config.js";

(async () => {
  const projectList = await fzf({ list: config.user.oc.cuyo.namespaces });

  if (!projectList.selected) return process.exit(1);
  const { value: project } = projectList.selected;

  const pods = executeScript("oc/get_pods", {
    args: [project],
    supressStdout: true
  });

  const podsList = await fzf({ list: pods.split("\n") });

  if (!podsList.selected) return process.exit(1);
  const { value: pod } = podsList.selected;

  clearConsole();
  executeScript("oc/download_logs", { args: [pod, pods, project] });
})();
