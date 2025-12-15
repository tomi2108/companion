
import { Logger } from ".";

export class DebugLogger implements Logger {

  success(message: string) {
    console.log(`[SUCCESS]: ${message}`);
  }

  info(message: string) {
    console.log(`[INFO]: ${message}`);
  }

  debug(message: string) {
    console.log(`[DEBUG]: ${message}`);
  }

  error(message: string): undefined {
    console.log(`[ERROR]: ${message}`);
    process.exit(1);
  }

  warning(message: string) {
    console.log(`[WARNING]: ${message}`);
  }

}
