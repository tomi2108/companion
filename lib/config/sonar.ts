import z from "zod/v4";

import { ExecutionContext } from "@lib/ctx";

import { ConfigHelp, ConfigSection } from "./interface";

const schema = z.object({
  server: z.string(),
  token: z.string()
});

export class SonarConfig implements ConfigSection {
  key = "sonar";

  defaults(): Record<string, unknown> {
    return {
      server: process.env.MARO_SONAR_SERVER ?? ""
    };
  }

  help(): ConfigHelp[] {
    return [
      { key: "server", description: "SonarQube server URL", type: "string" },
      { key: "token", description: "Sonar authentication token", type: "string" }
    ];
  }
  validate(config: unknown) {
    return schema.parse(config);
  }

  async setup(ctx: ExecutionContext) {
    const token = await ctx.ui.password({ message: "Enter Sonar auth token" });
    return { token };
  }

}
