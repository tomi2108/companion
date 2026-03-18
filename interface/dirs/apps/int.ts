import { AmqSender } from "./capabilities/amq_sender";
import { S3Capability } from "./capabilities/s3";
import { WithConnection } from "./connections";
import { ApigwConnection } from "./connections/apigw";
import { Digit3Connection } from "./connections/digit3";
import { ProjectLayout } from "./project/layout";

export class IntApp extends WithConnection {
  readonly type = "int";

  override features = [
    new AmqSender(),
    new S3Capability()
  ];

  override connections = [
    new ApigwConnection(),
    new Digit3Connection()
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
