// TODO: Replace all logging with this
// TODO: Add logging of error whenever we process.exit(1)
// and maybe find a better way of exiting with custom errors... ?

import { AsyncLocalStorage } from "node:async_hooks";

export const storage = new AsyncLocalStorage<{ startTime: number; command: string; debug: boolean }>();
function getLogItem(message: string, level: string) {
  const { startTime, debug, ...rest } = storage.getStore() ?? {};
  const logTime = new Date().getTime();
  const logItem = {
    message,
    ...rest,
    elapsedTime: startTime && `${logTime - startTime}ms`,
    level
  };
  return debug ? JSON.stringify(logItem, null, 2) : logItem.message;
}

function success(message: string) {
  console.log(getLogItem(message, "SUCCESS"));
}

function info(message: string) {
  console.log(getLogItem(message, "INFO"));
}

function error(message: string) {
  console.log(getLogItem(message, "ERROR"));
}

function warning(message: string) {
  console.log(getLogItem(message, "WARNING"));
}

export default { success, error, warning, info };
