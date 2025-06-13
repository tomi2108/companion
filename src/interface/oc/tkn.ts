import { executeScript, clearConsole } from "../cmd";

export function pipelineLogs(pipeline: string) {
  clearConsole();
  return executeScript("tkn/logs", {
    args: [pipeline]
  });
}

export function getPipelineRuns(project: string) {
  return JSON.parse(executeScript("tkn/get_pipeline_runs", {
    args: [project],
    supressStdout: true
  }));
}

