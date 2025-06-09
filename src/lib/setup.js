import path from "node:path";
import fs from "node:fs";

// TODO: if not installed give the user a link to official docs for installing

export function setup() {
  const ocOk = setupOpenShift();
  const glabOk = setupGitLab();
  const jiraOk = setupJira();
  const tknOk = setupTkn();

  if (!ocOk || !glabOk || !jiraOk || !tknOk) {
    console.error(`Checked in: ${paths_to_check.join("\n")}`);
    process.exit(1);
  }
}

function setupGitLab() {
  const found = checkInstalled("glab");
  if (!found) logProgramNotFound("Gitlab client", "http://something.com");
  checkConfig("glab");
  return found;
}

function setupJira() {
  const found = checkInstalled("jira");
  if (!found) logProgramNotFound("Jira client", "http://something.com");
  checkConfig("jira");
  return found;
}

function setupOpenShift() {
  const found = checkInstalled("oc");
  if (!found) logProgramNotFound("Openshift client", "http://something.com");
  checkConfig("oc");
  return found;
}

function setupTkn() {
  const found = checkInstalled("tkn");
  if (!found) logProgramNotFound("Tkn client", "http://something.com");
  // TODO: check if tkn really needs a config I think it just takes openshifts config
  checkConfig("tkn");
  return found;
}

const paths_to_check = ["/usr/bin"];
function checkInstalled(program) {
  // TODO: check if programs is installed in the system
  // probably add more options for linux and search where windows
  // stores packages... may be give users a config to point to the exact
  // executable or to its folder?

  const found = paths_to_check.some((p) => fs.existsSync(path.resolve(p, program)));
  return found;
}

function logProgramNotFound(program, link) {
  console.error(`${program} executable not found and it is required for proper function`);
  console.error(`See ${link} for an installation guide`);
}

function checkConfig(program) {
  // TODO: check if programs config is present in system and has everything we need
  // compare each programs config against ours and make changes if needed overriding the programs
  // config. programs config are under /.configs directory
  // probably need a separate function for each program since configs are pretty different
  // and to specific
  return Boolean(program);
}
