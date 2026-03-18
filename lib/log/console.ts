// TODO(20260318-002444): Replace all logging with this
// TODO(20260318-00244): Add logging of error whenever we process.exit(1)
// and maybe find a better way of exiting with custom errors... ?

import { Logger } from ".";

export class ConsoleLogger implements Logger {

  success(...messages: string[]) {
    console.log(`(${new Date().toISOString()})`, "[SUCCESS]:", ...messages);
  }

  info(...messages: string[]) {
    console.log(`(${new Date().toISOString()})`, "[INFO]:", ...messages);
  }

  debug(...messages: string[]) {
    console.log(`(${new Date().toISOString()})`, "[DEBUG]:", ...messages);
  }

  error(...messages: string[]) {
    console.log(`(${new Date().toISOString()})`, "[ERROR]:", ...messages);
  }

  warning(...messages: string[]) {
    console.log(`(${new Date().toISOString()})`, "[WARNING]:", ...messages);
  }

}