#!/usr/bin/env node

import cp from "node:child_process";
import path from "node:path";

const cmd = "node --no-warnings " + path.resolve(__dirname, "companion");
const args = process.argv.slice(2);

cp.spawnSync(cmd, args, {
  stdio: "inherit",
  shell: true
});
