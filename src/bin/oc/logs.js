#!/usr/bin/env node

import { clearConsole } from "../../lib/cmd.js";
import fzf from "node-fzf";
import { getPods, getProjects, login, tailLog } from "../../lib/oc.js";

(async () => {
  login();
  const projects = getProjects();
  const projectList = await fzf({ list: projects });

  if (!projectList.selected) return process.exit(1);
  const { value: project } = projectList.selected;

  const pods = getPods(project);
  const podsList = await fzf({ list: pods });

  if (!podsList.selected) return process.exit(1);
  const { value: pod } = podsList.selected;

  clearConsole();
  tailLog(pod);
})();
