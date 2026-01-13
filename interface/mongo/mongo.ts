import mongoose, { Model } from "mongoose";

import { TextFile } from "@files/text_file";
import { Config, ConfigError } from "@lib/config";

export class Mongo {
  private uri: string;

  async connect() {
    mongoose.set("debug", true);
    await mongoose.connect(this.uri);
  }

  async disconnect() {
    await mongoose.disconnect();
  }

  async getModel(file: TextFile) {
    const content = await import(file.path);
    const name = content.name;
    const schema = content.default;
    if (!name) throw new Error(`Missing name in ${file}, export const the name of the schema`);
    if (!schema) throw new Error(`Missing schema in ${file}, export default the mongoose.schema call`);
    return mongoose.model(name, schema as any) as Model<any>;
  }

  constructor(project: string) {
    const mongo_config = Config.get().mongo?.credentials?.[project];
    if (!mongo_config) throw new ConfigError(`mongo.credentials.${project}`);
    const user = mongo_config.user;
    const password = mongo_config.password;
    const port = mongo_config.port ?? 27017;
    const server = mongo_config.server;
    const db = mongo_config.db;
    const username = user && password ? `${user}:${password}@` : "";
    this.uri = `mongodb://${username}${server}:${port}/${db}?authSource=admin`;
  }
}
