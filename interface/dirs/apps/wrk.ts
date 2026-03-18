import { CreateApp } from ".";
import { Capability } from "./capabilities";
import { AmqReciever } from "./capabilities/amq_reciever";
import { ProjectLayout } from "./project/layout";

export class WrkApp extends CreateApp {
  readonly type = "wrk";
  override capabilities: Capability[] = [new AmqReciever()];

  override moves(layout: ProjectLayout) {
    return [{ from: layout.srcFile("wrk_app.ts"), to: layout.srcFile("app.ts") }];
  }

  envs(layout: ProjectLayout) {
    return [layout.configFile("fcd_environment.ts")];
  }

}
