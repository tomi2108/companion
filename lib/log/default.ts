// TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/companion/-/issues/33]: Replace all logging with this
// TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/companion/-/issues/32]: Add logging of error whenever we process.exit(1)
// and maybe find a better way of exiting with custom errors... ?

import { Logger } from ".";

export class DefaultLogger implements Logger {

  success(message: string) {
    console.log(`[SUCCESS]: ${message}`);
  }

  info() { }

  debug() { }

  error(message: string): undefined {
    console.log(`[ERROR]: ${message}`);
    process.exit(1);
  }

  warning(message: string) {
    console.log(`[WARNING]: ${message}`);
  }

}
