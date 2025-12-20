import { JsonFormatter } from "@files/formatters/json_formatter";
import { ExecutionContext } from "@lib/ctx";
import { Pod } from "@oc/pod";
import { WorkflowOptions, WorkflowStep } from "@workflow/steps";

type Reads = { pod: Pod };
type Writes = {};
type Options = {
  raw?: boolean;
};

export class DownloadPodLogs extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options?: WorkflowOptions<Options, Writes>) {
    super();
  }

  async run(_: ExecutionContext, { pod }: Reads) {
    const formatter = new JsonFormatter();
    const logs = await pod.getLogs();
    const formattedLogs = this.options?.raw
      ? logs
      : formatter.toString(
        logs.split("\n").map((l) =>
          formatter.tryFromString(l)
        ).filter(Boolean)
      );

    const date = new Date().toISOString();
    const file_name = `[${date}]_${pod.name}`;
    return { log_file: { name: file_name, log: formattedLogs } };
  }
}
