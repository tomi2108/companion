import { Capability } from ".";
import { ProjectLayout } from "../project/layout";

export class AmqSender implements Capability {

  dependencies() {
    return [{ name: "rhea-promise" }];
  }

  envs(layout: ProjectLayout) {
    return [layout.configFile("amq_environment.ts")];
  }

  toString() {
    return "amq sender";
  }
}
