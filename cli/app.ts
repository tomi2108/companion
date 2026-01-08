#!/usr/bin/env node

import cp from "node:child_process";
import path from "node:path";

const clair = path.join(__dirname, "clair");
const env = path.resolve(__dirname, "../../.env");
const cmd = `node --env-file ${env} --no-warnings ${clair}`;
const args = process.argv.slice(2);

cp.spawnSync(cmd, args, {
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_TLS_REJECT_UNAUTHORIZED: "0"
  },
  shell: true
});
