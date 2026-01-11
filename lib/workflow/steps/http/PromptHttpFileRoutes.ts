import { HttpMethod } from "@files/formatters/http_formatter";
import { HttpFile } from "@interface/http/http_file";
import { Req } from "@interface/http/req";
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
    const requests = http_file.getRequests()
      .filter((r) => r.pathname !== "/health");
    const service = http_file.service;

    const services = await ctx.ui.promptChoice(requests, {
      multiple,
      message: `Choose request for ${service}`
    });

    if (Array.isArray(services)) return { requests: services };
    return { request: services as Req };
  }
}
