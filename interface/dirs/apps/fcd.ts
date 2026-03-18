import { CreateApp } from ".";
import { ProjectLayout } from "./project/layout";

export class FcdApp extends CreateApp {
  readonly type = "fcd";

  override dependencies() {
    return [...super.dependencies(), { name: "axios", version: "0.21.4" }];
  }

  override envs(layout: ProjectLayout) {
    return [layout.configFile("fcd_environment.ts")];
  }

}
