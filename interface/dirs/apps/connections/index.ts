import { CreateApp } from "..";
import { Connection } from "./connection";
import { ProjectLayout } from "../project/layout";

export abstract class WithConnection extends CreateApp {
  override connections: Connection[] = [];

  constructor(
    override connection?: Connection
  ) {
    super();
  }

  override moves(layout: ProjectLayout) {
    return this.connection?.moves(layout) ?? [];
  }

  override dependencies() {
    return this.connection?.dependencies() ?? [];
  }

  envs(layout: ProjectLayout) {
    return this.connection?.envs(layout) ?? [];
  }
}
