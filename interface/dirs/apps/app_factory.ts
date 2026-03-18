import { AppType } from "@lib/constants";

import { CreateApp } from ".";
import { Capability } from "./capabilities";
import { CrnApp } from "./crn";
import { DaoApp } from "./dao";
import { FcdApp } from "./fcd";
import { IntApp } from "./int";
import { WrkApp } from "./wrk";

export class AppFactory {

  getApp(type: Exclude<AppType, "app">) {
    const apps: Record<Exclude<AppType, "app">, CreateApp> = {
      int: new IntApp(),
      dao: new DaoApp(),
      crn: new CrnApp(),
      fcd: new FcdApp(),
      wrk: new WrkApp()
    };
    const app = apps[type];
    return app;
  }

  withCapabilities(app: CreateApp, capabilities: Capability[]) {
    app.capabilities = capabilities;
    return app;
  }

}
