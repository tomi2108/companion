import { Capability } from ".";
import { ProjectLayout } from "../project/layout";

export class S3Capability implements Capability {

  dependencies() {
    return [{ name: "@aws-sdk/client-s3" }, { name: "@aws-sdk/node-http-handler" }];
  }

  envs(layout: ProjectLayout) {
    return [layout.configFile("s3_environment.ts")];
  }

  toString() {
    return "s3";
  }
}
