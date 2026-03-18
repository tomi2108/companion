import { CreateApp } from ".";
import { AmqSender } from "./capabilities/amq_sender";
import { S3Capability } from "./capabilities/s3";
import { ProjectLayout } from "./project/layout";

export class CrnApp extends CreateApp {
  readonly type = "crn";

  override features = [
    new AmqSender(),
    new S3Capability()
  ];

  override dependencies() {
    return [...super.dependencies(), { name: "axios", version: "0.21.4" }];
  }

  envs(layout: ProjectLayout) {
    return [layout.configFile("fcd_environment.ts")];
  }

}
