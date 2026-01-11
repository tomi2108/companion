// TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/maro/-/issues/33]: Replace all logging with this
// TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/maro/-/issues/32]: Add logging of error whenever we process.exit(1)
// and maybe find a better way of exiting with custom errors... ?

import { Logger } from ".";

export class DefaultLogger implements Logger {

  success(...messages: string[]) {
    console.log("[SUCCESS]:", ...messages);
  }

  info(...messages: string[]) {
    console.log("[INFO]:", ...messages);
  }

  debug() { }

  error(...messages: string[]) {
    console.log("[ERROR]:", ...messages);
  }

  warning(...messages: string[]) {
    console.log("[WARNING]:", ...messages);
  }

}
