import axios from "axios";
import fs from "node:fs";
import path from "node:path";

import { getPath } from "@files";
import { createLogFile } from "@files/utils";
import { Sql } from "@interface/sql/sql";
import { ExecutionContext } from "@lib/ctx";
import { PromptHttpFile } from "@workflow/steps/http/PromptHttpFile";
import { PromptHttpFileRoutes } from "@workflow/steps/http/PromptHttpFileRoutes";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { Workflow } from "@workflow/workflow";

export default {
  command: "dataset",
  aliases: [],
  describe: "Creates a dataset that succeeds for a given request",
  handler: async () => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new PromptOcProject({ server: "cuyo" }),
      new PromptHttpFile(),
      new PromptHttpFileRoutes()
    ]).run(ctx);

    const config = ctx.config;
    const log = ctx.logger;
    const repo = getPath("dataset");
    const queries = repo.sub("queries");
    if (!queries.exists()) {
      log.error(`Queries folder not found at ${queries}`);
      return {};
    }

    const dataset = repo.sub("dataset");
    dataset.create();
    const postscripts = repo.sub("postscripts", "scripts");
    postscripts.create();
    const postscripts_results = repo.sub("postscripts", "results");
    postscripts_results.create();

    const sql = new Sql(project.name);

    const query_files = queries.readFiles();
    const query_file = await ctx.ui.promptChoice(query_files, { message: "Choose query to inject variables" });

    const postscripts_files = postscripts.readFiles();
    const postscript_file = await ctx.ui.promptChoice(
      postscripts_files,
      {
        message: "Choose query to inject variables",
        optional: true
      }
    );

    const postscript = postscript_file ? (await import(postscript_file.path)).default : () => { };

    const query = query_file.read();
    const queryRes = await sql.query(query);

    const results = await Promise.all(
      queryRes.map(async (value) => {
        const url = `http://${service}-${project.name}.apps.${config.openshift.server_name}.cuyorh.tcloud.ar`;
        try {
          const { res, config } = await req.send(url, value);
          return { request: config, response: res, query: value };
        } catch (err) {
          if (axios.isAxiosError(err)) return { request: config, response: err.response, query: value };
          return { request: config, response: null, query: value };
        }
      }));

    const file_name = requestString.replaceAll(" ", "_").replaceAll("/", "_");

    const postscript_res = postscript(results);
    if (postscript_res) {
      const filename = `${file_name}.json`;
      const postscript_results_dir = path.join(postscripts_results_path, project.name, service);
      createDirIfNotExists(postscript_results_dir);
      const postscript_results_file = path.join(postscript_results_dir, filename);
      fs.writeFileSync(postscript_results_file, JSON.stringify(postscript_res, undefined, 2));
      log.success(`Post scripts results created in ${postscript_results_file}`);
    }

    const date = new Date().toISOString();
    const dataset = results.map(
      (r) => r.response?.status && r.response.status <= 299 ? r.query : null)
      .filter((s) => s !== null
      );
    const result = {
      service,
      project: project.name,
      lastUpdated: date,
      query: query_file,
      postscript: postscripts_file,
      request: {
        endpoint: requestString,
        params: req.params
      },
      dataset
    };
    const resultString = toYaml(result);
    const project_dir = path.join(dataset_path, project.name);
    createDirIfNotExists(project_dir);
    const service_dir = path.join(project_dir, service);
    createDirIfNotExists(service_dir);
    fs.writeFileSync(path.join(service_dir, `${file_name}.yaml`), resultString);

    const log_file_name = `${file_name}.json`;
    const log_file = createLogFile(path.join(project.name, service, log_file_name));
    if (log_file) {
      const logs = {
        service,
        project: project.name,
        date,
        query: query_file,
        postscript: postscripts_file,
        results: results.map((r) => ({
          ...r,
          response: r.response ? {
            data: r.response?.data ?? null,
            status: r.response?.status ?? null
          } : null
        }))
      };
      fs.writeFileSync(log_file, JSON.stringify(logs, undefined, 2));
      log.success(`Log created in ${log_file}`);
    }

    log.success(`Succeeded ${dataset.length} cases`);
    log.info(`Tried ${results.length} cases`);
  }
};
