import { createLogFile } from "@files/utils";

import { ConsoleLogger } from "./console";
import { FileLogger } from "./file";

export class DebugLogger extends ConsoleLogger {
  file_logger: FileLogger;

  constructor() {
    super();
    this.file_logger = new FileLogger(
      createLogFile(new Date().toISOString()).path
    );
  }

  override success(...messages: string[]) {
    super.success();
    this.file_logger.success(...messages);
  }

  override info(...messages: string[]) {
    super.info();
    this.file_logger.info(...messages);
  }

  override debug(...messages: string[]) {
    super.debug();
    this.file_logger.debug(...messages);
  }

  override error(...messages: string[]) {
    super.error();
    this.file_logger.error(...messages);
  }

  override warning(...messages: string[]) {
    super.warning();
    this.file_logger.warning(...messages);
  }
}
