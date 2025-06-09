
export function setup() {
  setupOpenShift();
  setupGitLab();
  setupTkn();
}

function setupGitLab() {
  checkInstalled("glab");
  checkConfig("glab");
}

function setupOpenShift() {
  checkInstalled("oc");
  checkConfig("oc");
}

function setupTkn() {
  checkInstalled("tkn");
  // TODO: check if tkn really needs a config
  checkConfig("tkn");
}

function checkInstalled(program) {
  // TODO: check if programs is installed in the system
  // TODO: if not installed give the user a link to official docs for installing
  return Boolean(program);
}

function checkConfig(program) {
  // TODO: check if programs config is present in system and has everything we need
  // compare each programs config against ours and make changes if needed overriding the programs
  // config. programs config are under /.configs directory
  return Boolean(program);
}
