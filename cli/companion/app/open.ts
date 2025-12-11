import fs from "node:fs";
import path from "node:path";

import { HttpFile } from "@interface/http/http_file";
import { promptForOcResource } from "@interface/prompts";
import { Config, ConfigError, openInBrowser } from "@lib/config";
import { search } from "@lib/ui";
import { Openshift } from "@oc";
import { filterFrontendDeployments, getOcToken } from "@oc/api";

export default {
  command: "open",
  aliases: ["o"],
  describe: "Open app in browser",
  handler: async () => {
    const config = Config.get();
    const local_port = config.app.open?.default_port ?? 8080;
    const base_path = config.app.open?.base_path ?? "";

    const data_dir = config.app.open?.data_dir;
    if (!data_dir) throw new ConfigError("app.open.data_dir");

    const token_app = config.app.open?.token_app;
    if (!token_app) throw new ConfigError("app.open.token_app");

    const host_template = config.openshift.mf_host_template;
    if (!host_template) throw new ConfigError("openshift.mf_host_template");

    const rest_path = config.paths.rest;
    if (!rest_path) throw new ConfigError("paths.rest");

    const token_file = config.app.open?.token_file;
    if (!token_file) throw new ConfigError("app.open.token_file");

    const routes_file = config.app.open?.routes_file;
    if (!routes_file) throw new ConfigError("app.open.token_file");

    const http = new HttpFile(path.join(rest_path, token_file));

    const token_req = http.requests[0];
    if (!token_req) throw new Error(`Missing request in ${http.file_path}`);

    const projects = await new Openshift(await getOcToken()).getProjects();
    const choices = [{ name: "Local" }, ...projects.map((p) => p.toChoice())];
    const namespace = await search({ choices, message: "Choose project" });
    const isLocal = namespace === "Local";
    const token_namespace = !isLocal ? namespace : (await promptForOcResource(projects, { message: "Choose namespace to get token from" })).name;

    const url = (() => {
      if (!isLocal) return `http://${token_app}-${namespace}.apps.${config.openshift.server_name}.cuyorh.tcloud.ar`;
      return `http://${token_app}-${token_namespace}.apps.${config.openshift.server_name}.cuyorh.tcloud.ar`;
    })();

    const routes = fs.readFileSync(path.join(rest_path, routes_file)).toString().split("\n");
    const pathname = await search({ choices: routes, message: "Choose route" });

    const data_file = fs.readFileSync(path.join(rest_path, data_dir, `${token_namespace}.json`)).toString();
    const options = JSON.parse(data_file);
    const chosen_data_name = await search({ message: "Choose data", choices: options });
    const chose_data = options.find((o: { name: string }) => o.name === chosen_data_name);

    const { res } = await token_req.send(url, chose_data);
    const token = res.data.token;
    const app_host = await (async () => {
      if (isLocal) return `localhost:${local_port}`;
      const project = projects.find((p) => p.name === namespace);
      const frontend_deployments = (await project?.getDeployments())?.filter(filterFrontendDeployments);
      const env = frontend_deployments?.[0]?.env as string;
      return host_template.replaceAll("{{env}}", env);
    })();
    const open_url = new URL(`http://${app_host}`);
    open_url.searchParams.set("token", token);
    open_url.pathname = `${base_path}${pathname}`;
    openInBrowser(open_url.toString());
  }
};
