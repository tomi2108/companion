import { WithConnection } from "./connections";
import { MongoConnection } from "./connections/mongo";
import { SqlConnection } from "./connections/sql";
import { ProjectLayout } from "./project/layout";

export class DaoApp extends WithConnection {
  readonly type = "dao";

  override connections = [
    new SqlConnection(),
    new MongoConnection()
  ];

  override envs(layout: ProjectLayout) {
    const envs = super.envs(layout);
    if (envs.length === 0) return [layout.configFile("fcd_environment.ts")];
    return envs;
  }

  override withConnection(connection: typeof this.connections[number]) {
    this.connection = connection;
    return this;
  }
}
