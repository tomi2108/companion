import { YamlFormatter } from "@files/formatters/yaml_formatter";
import { TempFile } from "@files/temp_file";
import { ExecutionContext } from "@lib/ctx";
import { Resource } from "@oc/resource";

import { WorkflowStep } from "../..";

type Reads = { resource: Resource };
type Writes = {};
type Options = {};

export class EditResource extends WorkflowStep<Reads, Writes, Options> {

  async run(ctx: ExecutionContext, { resource }: Reads) {
    const log = ctx.logger;
    const formatter = new YamlFormatter();

    const { changed, new_content } = await new TempFile({
      content: formatter.toString(await resource.toYaml()),
      ext: "yaml"
    }).prompt();

    if (!changed || !new_content) {
      log.info("Edit canceled, no changes made");
      return {};
    }

    const y = formatter.fromString(new_content);
    if (!y
      || typeof y !== "object"
      || !("data" in y)
      || typeof y.data !== "object"
      || !y.data
    ) {
      log.error("Invalid yaml, please sepcify 'data' key");
      return {};
    }
    const { data } = y;
    resource.setData(data as Record<string, string>);
    await resource.save({ update: true });
    log.success(`${resource.kind} saved succesfully`);
    return {};
  }
}
