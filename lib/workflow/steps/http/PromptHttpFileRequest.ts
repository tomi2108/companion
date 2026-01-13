import { HttpFile } from "@interface/http/http_file";
import { Req } from "@interface/http/req";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = { http_file: HttpFile };
type Writes<Multiple> = Multiple extends true ? { requests: Req[] } : { request: Req };
type Options<Multiple> = {
  multiple?: Multiple;
};

export class PromptHttpFileRequest<Multiple extends boolean = false>
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

    if (Array.isArray(services)) return { requests: services } as Writes<Multiple>;
    return { request: services } as Writes<Multiple>;
  }
}
