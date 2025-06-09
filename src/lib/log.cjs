// TODO: Replace all logging with this
// TODO: Add logging of error whenever we process.exit(1)
// and maybe find a better way of exiting with custom errors... ?

const log = {};

log.success = function(string) {
  console.log(`✔ ${string}`);
};

log.info = function(string) {
  console.log(string);
};

log.error = function(string) {
  console.error(string);
};

log.warning = function(string) {
  console.warn(string);
};

module.exports = log;
