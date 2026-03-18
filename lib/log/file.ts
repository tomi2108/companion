import { TextFile } from "@files/text_file";

import { Logger } from ".";

export class FileLogger implements Logger {
  file: TextFile;

  constructor(path: string) {
    this.file = new TextFile(path);
  }

  success(...messages: string[]) {
    const message = ["[SUCCESS]:", ...messages].join(" ");
    this.file.appendLine(message);
  }

  info(...messages: string[]) {
    const message = ["[INFO]:", ...messages].join(" ");
    this.file.appendLine(message);
  }

  debug(...messages: string[]) {
    const message = ["[DEBUG]:", ...messages].join(" ");
    this.file.appendLine(message);
  }

  error(...messages: string[]) {
    const message = ["[ERROR]:", ...messages].join(" ");
    this.file.appendLine(message);
  }

  warning(...messages: string[]) {
    const message = ["[WARNING]:", ...messages].join(" ");
    this.file.appendLine(message);
  }

}
