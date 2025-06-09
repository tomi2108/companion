// TODO: Replace all logging with this
function logSuccess(string) {
  console.log(`✔ ${string}`);
}

function logInfo(string) {
  console.log(string);
}

function logError(string) {
  console.error(string);
}

function logWarning(string) {
  console.warn(string);
}

module.exports = { logSuccess, logError, logInfo, logWarning };
