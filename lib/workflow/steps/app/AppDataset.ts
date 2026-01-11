import axios from "axios";

import { getPath } from "@files";
import { Dir } from "@files/dir";
import { JsonFile } from "@files/json_file";
import { YamlFile } from "@files/yaml_file";
import { HttpFile } from "@interface/http/http_file";
import { Req } from "@interface/http/req";
import { Sql } from "@interface/sql/sql";
import { ExecutionContext } from "@lib/ctx";
import { Project } from "@oc/project";

import { WorkflowStep } from "..";

type Reads = {
  project: Project;
  http_file: HttpFile;
  request: Req;
};
type Writes = {};
type Options = {};

export class AppDataset extends WorkflowStep<Reads, Writes, Options> {

  async run(ctx: ExecutionContext, { project, http_file, request }: Reads) {
    const config = ctx.config;
    const logger = ctx.logger;
    const repo = getPath("dataset");
    const queries = repo.sub("queries");
    if (!queries.exists()) {
      logger.error(`Queries folder not found at ${queries}`);
      return {};
    }

    const dataset_dir = repo.sub("dataset_dir");
    const postscripts = repo.sub("postscripts", "scripts");
    const postscripts_results = repo.sub("postscripts", "results");
    dataset_dir.create();
    postscripts.create();
    postscripts_results.create();

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

    const query = query_file.read();
    const postscript = postscript_file ? (await import(postscript_file.path)).default : () => { };

    const sql = new Sql(project.name);
    const queryRes = await sql.query(query);

    const service = http_file.service;
    const url = `http://${service}-${project.name}.apps.${config.openshift.server_name}.cuyorh.tcloud.ar`;
    const subdir = new Dir(project.name).sub(service);

    const results = await Promise.all(
      queryRes.map(async (value) => {
        try {
          const { res, config } = await request.send(url, value);
          return { request: config, response: res, query: value };
        } catch (err) {
          if (axios.isAxiosError(err)) return { request: config, response: err.response, query: value };
          return { request: config, response: null, query: value };
        }
      }));

    const file_name = request.toString().replaceAll(" ", "_").replaceAll("/", "_");
    const postscript_res = postscript(results);

    if (postscript_res) {
      const dir = postscripts_results.join(subdir);
      dir.create();
      const res_file = new JsonFile(dir.createFile(`${file_name}.json`).path);
      res_file.write(postscript_res);
      logger.success(`Post scripts results created in ${res_file}`);
    }

    const date = new Date().toISOString();
    const dataset = results.map(
      (r) => r.response?.status && r.response.status <= 299 ? r.query : null
    ).filter((s) => s !== null);

    const result = {
      service,
      project: project.name,
      lastUpdated: date,
      query: query_file.name(),
      postscript: postscript_file?.name(),
      request: {
        endpoint: request.toString(),
        params: request.params
      },
      dataset
    };

    const dir = dataset_dir.join(subdir);
    dir.create();
    const results_file = new YamlFile(dir.createFile(`${file_name}.yaml`).path);
    results_file.write(result);

    const log_file_name = `${file_name}.json`;
    const log = {
      service,
      project: project.name,
      date,
      query: query_file.name(),
      postscript: postscript_file?.name(),
      results: results.map((r) => ({
        ...r,
        response: r.response ? {
          data: r.response?.data ?? null,
          status: r.response?.status ?? null
        } : null
      }))
    };
    logger.success(`Succeeded ${dataset.length} cases`);
    logger.info(`Tried ${results.length} cases`);

    return {
      log_file: {
        name: log_file_name,
        dir: subdir,
        log
      }
    };
  }
}
