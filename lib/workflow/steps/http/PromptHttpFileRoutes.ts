import { HttpMethod } from "@files/formatters/http_formatter";
import { HttpFile } from "@interface/http/http_file";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";

type Reads = { http_file: HttpFile };
type Writes = {
  services: { method: HttpMethod; endpoint: string }[];
};
type Options = {};

export class PromptHttpFileRoutes extends WorkflowStep<Reads, Writes, Options> {

  async run(ctx: ExecutionContext, { http_file }: Reads) {
    const routes = http_file.read().requests
      .filter((r) => r.pathname !== "/health")
      .map((r) => ({ method: r.method, endpoint: r.pathname }));
    const service = http_file.service;

    const services = (await ctx.ui.search({
      multiple: true,
      choices: routes.map((r) => `${r.method} ${r.endpoint}`),
      message: `Choose routes for ${service}`
    })).map((r) => {
      const [method, endpoint] = r.split(" ");
      const found = routes.find((r) => r.method === method && r.endpoint === endpoint);
      return found;
    }).filter((r) => r !== undefined);

    return { services };
  }
}
