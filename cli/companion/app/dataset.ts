import axios, { AxiosRequestConfig } from "axios";
import fs from "node:fs";
import path from "node:path";

import { createDirIfNotExists, createLogFile, getAppCollections } from "@files/utils";
import { promptForOcResource } from "@interface/prompts";
import { Sql } from "@interface/sql/sql";
import { Config, ConfigError } from "@lib/config";
import log from "@lib/log";
import { search } from "@lib/ui";
import { readfiles, toYaml } from "@lib/utils";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";

export default {
  command: "dataset",
  aliases: [],
  describe: "Creates a dataset that succeeds for a given request",
  handler: async () => {
    const config = Config.get();
    const log_path = config.preferences.logs_path;
    if (!log_path) throw new ConfigError("preferences.logs_path");
    const dataset_repo_path = config.paths.dataset;
    if (!dataset_repo_path) throw new ConfigError("paths.dataset");
    const queries_path = path.join(dataset_repo_path, "queries");
    if (!fs.existsSync(queries_path)) return log.error(`Queries folder not found at ${queries_path}`);
    const dataset_path = path.join(dataset_repo_path, "dataset");
    createDirIfNotExists(dataset_path);
    const postscripts_path = path.join(dataset_repo_path, "postscripts", "scripts");
    if (!fs.existsSync(queries_path)) return log.error(`Postscripts sciprts folder not found at ${postscripts_path}`);
    const postscripts_results_path = path.join(dataset_repo_path, "postscripts", "results");
    if (!fs.existsSync(queries_path)) return log.error(`Postscripts results folder not found at ${postscripts_path}`);

    const projects = await new Openshift(await getOcToken()).getProjects();
    const project = await promptForOcResource(projects);
    const sql = new Sql(project.name);

    const http_files = getAppCollections();
    const services = http_files
      .map((f) => f.service)
      .filter((s) => s !== null);
    const service = await search({ choices: [...services], message: "Choose service" });
    const file = http_files.find((f) => f.service === service);
    if (!file) return log.error("File not found");

    const requests = file.requests.map((r) => `${r.method} ${r.pathname}`);
    const requestString = await search({ choices: requests, message: `Choose request for ${service}` });
    const req = file.requests.find((r) => `${r.method} ${r.pathname}` === requestString);
    if (!req) return log.error("Request not found");

    const query_dir = readfiles(queries_path);
    const query_file = await search({ choices: query_dir, message: "Choose query to inject variables" });
    const query_file_path = path.join(queries_path, query_file);

    const postscripts_dir = readfiles(postscripts_path);
    const postscripts_file = await search({ choices: ["None", ...postscripts_dir], message: "Choose postscript to run for every request" });
    const postscripts_file_path = path.join(postscripts_path, postscripts_file);
    const postscript = postscripts_file === "None" ? () => { } : (await import(postscripts_file_path)).default;
    if (typeof postscript !== "function") return log.error(`Postscript ${postscripts_file} does not have an export default function`);

    const query = fs.readFileSync(query_file_path).toString();
    const queryRes = await sql.query(query);

    const results = await Promise.all(
      queryRes.map(async (value) => {
        file.variables = { ...file.variables, ...value };
        const path = file.replaceVariables(req.pathname);
        const params = req.params ? Object.fromEntries(
          Object.entries(req.params)
            .map(([k, v]) => [k, v ? file.replaceVariables(v) : ""]))
          : {};

        const reqConfig: AxiosRequestConfig = {
          method: req.method,
          url: `http://${service}-${project.name}.apps.${config.openshift.server_name}.cuyorh.tcloud.ar${path}`,
          params,
          data: JSON.parse(req.body ? file.replaceVariables(req.body) ?? "{}" : "{}")
        };
        try {

          const res = await axios.request(reqConfig);
          return { request: reqConfig, response: res, query: value };
        } catch (err) {
          if (axios.isAxiosError(err)) return { request: reqConfig, response: err.response, query: value };
          return { request: reqConfig, response: null, query: value };
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
    const dataset = results.map((r) => r.response?.status && r.response.status <= 299 ? r.query : null).filter((s) => s !== null);
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
          response: {
            data: r.response?.data ?? null,
            status: r.response?.data ?? null
          }
        }))
      };
      fs.writeFileSync(log_file, JSON.stringify(logs, undefined, 2));
      log.success(`Log created in ${log_file}`);
    }

    log.success(`Succeeded ${dataset.length} cases`);
    log.info(`Tried ${results.length} cases`);
  }
};
