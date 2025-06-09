#!/usr/bin/env node

import { executeScript } from "../../lib/cmd.js";
import fzf from "node-fzf";

(async () => {
  // TODO: probably get from config
  const projects = ["movistar-empresas-dev", "movistar-empresas-int", "movistar-empresas-cert", "movistar-empresas"];
  const opts = { list: projects };

  const { selected: { value: project } } = await fzf(opts);

  if (!project) return process.exit(1);
  executeScript("pods/tail_log", [project]);
})();
