// TODO: Replace all logging with this
// TODO: Add logging of error whenever we process.exit(1)
// and maybe find a better way of exiting with custom errors... ?

function success(message: string) {
  console.log(`✔ ${message}`);
}

function info(message: string) {
  console.log(message);
}

function error(message: string) {
  console.error(message);
}

function warning(message: string) {
  console.warn(message);
}

export default { success, error, warning, info };
