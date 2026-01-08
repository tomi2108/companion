import { YamlFormatter } from "@files/formatters/yaml_formatter";
import { TempFile } from "@files/temp_file";
import { ExecutionContext } from "@lib/ctx";
import { ConfigMap } from "@oc/configmap";

import { WorkflowStep } from "../..";

type Reads = { configmap: ConfigMap };
type Writes = {};
type Options = {};

export class EditConfigMap extends WorkflowStep<Reads, Writes, Options> {

  async run(ctx: ExecutionContext, { configmap }: Reads) {
    const log = ctx.logger;
    const formatter = new YamlFormatter();
    const { changed, new_content } = await new TempFile({
      content: formatter.toString(await configmap.toYaml()),
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
    configmap.setData(data as Record<string, string>);
    await configmap.save({ update: true });
    log.success("Config map saved succesfully");
    return {};
  }
}
