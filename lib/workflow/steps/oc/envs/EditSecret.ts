import { YamlFormatter } from "@files/formatters/yaml_formatter";
import { TempFile } from "@files/temp_file";
import { ExecutionContext } from "@lib/ctx";
import { Secret } from "@oc/secret";

import { WorkflowStep } from "../..";

type Reads = { secret: Secret };
type Writes = {};
type Options = {};

export class EditSecret extends WorkflowStep<Reads, Writes, Options> {

  async run(ctx: ExecutionContext, { secret }: Reads) {
    const log = ctx.logger;
    const formatter = new YamlFormatter();
    const { changed, new_content } = await new TempFile({
      content: formatter.toString(await secret.toYaml()),
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

    secret.setData(data as Record<string, string>);
    await secret.save();
    log.success("Secret saved succesfully");
    return {};
  }
}
