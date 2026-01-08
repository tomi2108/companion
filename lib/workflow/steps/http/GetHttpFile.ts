import { Dir } from "@files/dir";
import { AppRepo } from "@interface/dirs/app_repo";
import { HttpFile } from "@interface/http/http_file";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";
import { ValidateConfig } from "../config/ValidateConfig";

type Reads = { app_repo: AppRepo };
type Writes = { http_file?: HttpFile };
type Options = {};

export class GetHttpFile extends WorkflowStep<Reads, Writes, Options> {

  async run(ctx: ExecutionContext, { app_repo }: Reads) {
    const log = ctx.logger;
    new ValidateConfig({ keys: ["paths.rest"] });
    const rest_path = ctx.config.paths.rest!;
    const collections = new Dir(rest_path).sub("Collections").readFiles();
    const files = collections.map((n) => new HttpFile(n.path));
    const { name } = await app_repo.getInfo();
    const http_file = files.find((f) => f.service === name);

    if (!http_file) {
      log.error(`Could not find http_file for app ${name}`);
      return {};
    }
    return { http_file };
  }
}
