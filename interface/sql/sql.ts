import { Sequelize } from "sequelize";

import { Config, ConfigError } from "@lib/config";

export class Sql {
  instance: Sequelize;

  private async connect() {
    await this.instance.authenticate();
  }

  private async disconnect() {
    await this.instance.close();
  }

  async query(query: string) {
    await this.connect();
    const res = await this.instance.query(query);
    this.disconnect();
    return res[0].map((o) => Object.fromEntries(Object.entries(o as Record<string, unknown>).map(([k, v]) => [k, String(v)])));
  }

  constructor(project: string) {
    const sql_config = Config.getView().get("sql.credentials")[project];
    if (!sql_config) throw new ConfigError(`sql.credentials.${project}`);
    const user = sql_config.user;
    const password = sql_config.password;
    const port = sql_config.port ?? 1433;
    const server = sql_config.server;
    const db = sql_config.db;
    this.instance = new Sequelize(
      db,
      user,
      password,
      {
        logging: false,
        host: server,
        port,
        dialect: "mssql",
        dialectOptions: {
          options: {
            useUTC: true
          }
        }
      }
    );
  }
}
