import { HttpMethod } from "@files/formatters/http_formatter";
import { HttpFile } from "@interface/http/http_file";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "..";

type Service = { method: HttpMethod; endpoint: string };

type Reads = { http_file: HttpFile };
type Writes<Multiple> = Multiple extends true ? { services: Service[] } : { service: Service };
type Options<Multiple> = {
  multiple?: Multiple;
};

export class PromptHttpFileRoutes<Multiple extends boolean = false>
  extends WorkflowStep<Reads, Writes<Multiple>, Options<Multiple>> {

  constructor(override options?: WorkflowOptions<Options<Multiple>, Writes<Multiple>>) {
    super(options);
  }

  async run(ctx: ExecutionContext, { http_file }: Reads) {
    const multiple = this.options?.multiple;
    const routes = http_file.read().requests
      .filter((r) => r.pathname !== "/health")
      .map((r) => ({ method: r.method, endpoint: r.pathname }));
    const service = http_file.service;

    const services = await ctx.ui.search<Multiple>({
      multiple,
      choices: routes.map((r) => `${r.method} ${r.endpoint}`),
      message: `Choose routes for ${service}`
    });

    const find = (r: string) => {
      const [method, endpoint] = r.split(" ");
      const found = routes.find((r) => r.method === method && r.endpoint === endpoint);
      return found;
    };

    if (Array.isArray(services)) return { services: services.map(find) };
    return { service: find(services) };
  }
}
