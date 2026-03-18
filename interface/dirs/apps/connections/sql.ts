import { Connection } from "./connection";
import { ProjectLayout } from "../project/layout";

export class SqlConnection extends Connection {
  key = "sql";

  dependencies() {
    return [{ name: "sequelize" }];
  }

  moves(layout: ProjectLayout) {
    return [
      { from: layout.testConfigFile("sequelize.test.ts"), to: layout.testConfigFile("db.tests.ts") },
      { from: layout.configFile("dao_db.ts"), to: layout.configFile("db.ts") }
    ];
  }

  envs(layout: ProjectLayout) {
    return [layout.configFile("dao_environment.ts")];
  }
}

