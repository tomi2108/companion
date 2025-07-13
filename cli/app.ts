#!/usr/bin/env node

import cp from "node:child_process";
import path from "node:path";

const cmd = "NODE_TLS_REJECT_UNAUTHORIZED='0' node --no-warnings " + path.join(__dirname, "companion");
const args = process.argv.slice(2);

cp.spawnSync(cmd, args, {
  stdio: "inherit",
  env: process.env,
  shell: true
});
