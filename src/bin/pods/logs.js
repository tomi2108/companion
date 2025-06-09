#!/usr/bin/env node

import { clearConsole, executeScript } from "../../lib/cmd.js";
import fzf from "node-fzf";

(async () => {
  // TODO: probably get from config
  const projects = ["movistar-empresas-dev", "movistar-empresas-int", "movistar-empresas-cert", "movistar-empresas"];
  const { selected: { value: project } } = await fzf({ list: projects });
  if (!project) return process.exit(1);

  let pods;
  executeScript("pods/get_pods", {
    args: [project],
    onStdOut: (data) => pods = data,
    supressStdout: true
  });

  const { selected: { value: pod } } = await fzf({ list: pods.split("\n") });
  if (!pod) return process.exit(1);

  clearConsole();
  executeScript("pods/tail_log", { args: [pod] });
})();
