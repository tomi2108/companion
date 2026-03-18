import { Connection } from "./connection";
import { ProjectLayout } from "../project/layout";

export class Digit3Connection extends Connection {
  key = "digt3";

  dependencies() {
    return [{ name: "axios", version: "0.21.4" }];
  }

  moves(layout: ProjectLayout) {
    return [
      { from: layout.serviceFile("Digit3TokenService.ts"), to: layout.serviceFile("TokenService.ts") },
      { from: layout.testServiceFile("digit3.test.ts"), to: layout.testServiceFile("token.test.ts") },
      { from: layout.testFile("digit3_setupTests.ts"), to: layout.testFile("setupTest.ts") }
    ];
  }

  envs(layout: ProjectLayout) {
    return [layout.configFile("digit3_environment.ts")];
  }

}
