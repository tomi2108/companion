const { executeScript, clearConsole } = require("./cmd.cjs");

function pipelineLogs(pipeline) {
  clearConsole();
  return executeScript("tkn/logs", {
    args: [pipeline]
  });
}

function getPipelineRuns(project) {
  return JSON.parse(executeScript("tkn/get_pipeline_runs", {
    args: [project],
    supressStdout: true
  }));
}

module.exports = { pipelineLogs, getPipelineRuns };
