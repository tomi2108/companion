import { Config, ConfigError } from "@lib/config";
import { ExecutionContext } from "@lib/ctx";
import { OpenshiftServer } from "@oc/server";

import { WorkflowStep } from "../..";

type Writes = { server: OpenshiftServer };
type Options = {};
type Reads = {};

export class PromptOcServer extends WorkflowStep<Reads, Writes, Options> {

  async run(ctx: ExecutionContext) {
    const serversCfg = Config.getView().get("openshift.servers");
    if (!serversCfg) throw new ConfigError("openshift.servers");
    const names = Object.keys(serversCfg);
    const servers = names.map((n) => new OpenshiftServer(n));
    const server = await ctx.ui.promptChoice(servers);
    await server.authenticate();
    return { server };
  }
}
