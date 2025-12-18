import { TextFile } from "@files/text_file";
import { createLogFile } from "@files/utils";

import { Logger } from ".";

export class DebugLogger implements Logger {
  log_file: TextFile;

  constructor() {
    this.log_file = createLogFile(new Date().toISOString());
  }

  success(...messages: string[]) {
    const message = ["[SUCCESS]:", ...messages].join(" ");
    console.log(message);
    this.log_file.writeLine(message);
  }

  info(...messages: string[]) {
    const message = ["[INFO]:", ...messages].join(" ");
    console.log(message);
    this.log_file.writeLine(message);
  }

  debug(...messages: string[]) {
    const message = ["[DEBUG]:", ...messages].join(" ");
    console.log(message);
    this.log_file.writeLine(message);
  }

  error(...messages: string[]) {
    const message = ["[ERROR]:", ...messages].join(" ");
    console.log(message);
    this.log_file.writeLine(message);
  }

  warning(...messages: string[]) {
    const message = ["[WARNING]:", ...messages].join(" ");
    console.log(message);
    this.log_file.writeLine(message);
  }

}
