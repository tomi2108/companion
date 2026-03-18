import { Connection } from "./connection";
import { ProjectLayout } from "../project/layout";

export class ApigwConnection extends Connection {
  key = "apigw";

  dependencies() {
    return [{ name: "axios", version: "0.21.4" }];
  }

  moves(layout: ProjectLayout) {
    return [
      { from: layout.serviceFile("ApigwTokenService.ts"), to: layout.serviceFile("TokenService.ts") },
      { from: layout.testServiceFile("apigw.test.ts"), to: layout.testServiceFile("token.test.ts") },
      { from: layout.testFile("apigw_setupTest.ts"), to: layout.testFile("setupTest.ts") }
    ];
  }

  envs(layout: ProjectLayout) {
    return [layout.configFile("apigw_environment.ts")];
  }

}
