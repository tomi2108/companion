import axios, { AxiosRequestConfig } from "axios";
import fs from "node:fs";
import path from "node:path";

import { getAppCollections } from "@cli/monitors/new";
import { createDirIfNotExists } from "@files/utils";
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
    const rest_path = config.paths.rest;
    if (!rest_path) throw new ConfigError("paths.rest");
    const queries_path = path.join(rest_path, "queries");
    if (!fs.existsSync(queries_path)) return log.error(`Queries folder not found at ${queries_path}`);
    const dataset_path = path.join(rest_path, "dataset");
    createDirIfNotExists(dataset_path);
    const postscripts_path = path.join(rest_path, "postscripts");
    if (!fs.existsSync(queries_path)) return log.error(`Postscripts folder not found at ${postscripts_path}`);

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
          params
          // data: JSON.parse(file.replaceVariables(req.body) ?? "{}")
        };

        try {
          const res = await axios.request(reqConfig);
          return { request: reqConfig, response: res, query: value };
        } catch (err) {
          if (axios.isAxiosError(err)) return { request: reqConfig, response: err.response, query: null };
          return { request: reqConfig, response: null, query: null };
        }
      }));
    postscript(results);

    const dataset = results.map((r) => r.query).filter((r) => r !== null);
    const result = {
      service,
      project: project.name,
      lastUpdated: new Date().toISOString(),
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
    const file_name = `${requestString.replaceAll(" ", "_").replaceAll("/", "_")}.yaml`;
    fs.writeFileSync(path.join(service_dir, file_name), resultString);

    log.success(`Succeeded ${dataset.length} cases`);
    log.info(`Tried ${results.length} cases`);
  }
};
