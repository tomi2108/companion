import { setTimeout } from "node:timers/promises";

import { loading } from "@lib/ui";
import { PIPELINE_STATUS, PipelineRun } from "@oc/pipelinerun";

export async function waitForPipeline(pipeline: PipelineRun, loadingText?: string) {
  const spinner = loading(loadingText ?? "Running pipeline");
  while (await pipeline.status() === PIPELINE_STATUS.running) setTimeout(15 * 1000);
  const status = await pipeline.status();
  if (status === PIPELINE_STATUS.succeeded) spinner.succeed("Pipeline succeeded");
  else spinner.fail("Pipeline failed");
  return status;
}
