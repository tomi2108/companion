import { Connection } from "./connection";
import { ProjectLayout } from "../project/layout";

export class MongoConnection extends Connection {
  key = "mongo";

  dependencies() {
    return [{ name: "mongoose" }];
  }

  moves(layout: ProjectLayout) {
    return [
      // TODO(20260318-002445): add tests for bau connection to template
      // { from: path.join(tests_configuration, "mongoose.tests.ts"), to: path.join(configuration, "db.tests.ts") },
      { from: layout.configFile("bau_db.ts"), to: layout.configFile("db.ts") }
    ];
  }

  envs(layout: ProjectLayout) {
    return [layout.configFile("bau_environment.ts")];
  }

}