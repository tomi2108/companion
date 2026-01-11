import { getPath } from "@files";
import { JsonFile } from "@files/json_file";
import { HttpFile } from "@interface/http/http_file";
import { ExecutionContext } from "@lib/ctx";
import { openInBrowser } from "@lib/editor";
import { filterFrontendDeployments } from "@oc/api";
import { Project } from "@oc/project";

import { WorkflowStep } from "..";
import { ValidateConfig } from "../config/ValidateConfig";

type Reads = {
  local: boolean;
  project: Project;
};
type Writes = {};

export class AppOpen extends WorkflowStep<Reads, Writes> {

  async run(ctx: ExecutionContext, { project, local }: Reads) {
    new ValidateConfig({
      keys: [
        "app.open.data_dir",
        "app.open.token_app",
        "app.open.token_file",
        "app.open.routes_file",
        "openshift.mf_host_template"
      ]
    }).run(ctx);
    const config = ctx.config;
    const local_port = config.app.open?.default_port ?? 8080;
    const base_path = config.app.open?.base_path ?? "";
    const data_dir = config.app.open?.data_dir ?? "";
    const token_app = config.app.open?.token_app;
    const host_template = config.openshift.mf_host_template ?? "";

    const rest = getPath("rest");
    const token_file = rest.getRelative(config.app.open?.token_file ?? "");
    const routes_file = rest.getRelative(config.app.open?.routes_file ?? "");

    const http = new HttpFile(token_file.path);
    const token_req = http.getRequests()[0];
    if (!token_req) throw new Error(`Missing request in ${http}`);
    const namespace = project.name;

    const url = `http://${token_app}-${namespace}.apps.${config.openshift.server_name}.cuyorh.tcloud.ar`;

    const routes = routes_file.read().split("\n");
    const pathname = await ctx.ui.search({ choices: routes, message: "Choose route" });

    // TODO: consider making a ChoicesJsonFile
    const data_file = new JsonFile<{ name: string }[]>(
      rest
        .sub(data_dir)
        .getFile(`${namespace}.json`)
        .path
    );
    const options = data_file.read();
    const chosen_data_name = await ctx.ui.search({ message: "Choose data", choices: options });
    const chose_data = options.find((o: { name: string }) => o.name === chosen_data_name);

    const { res } = await token_req.send(url, chose_data);
    const token = res.data.token;

    const app_host = await (async () => {
      if (local) return `localhost:${local_port}`;
      const frontend_deployments = (await project?.getDeployments())?.filter(filterFrontendDeployments);
      const env = frontend_deployments?.[0]?.env as string;
      return host_template.replaceAll("{{env}}", env);
    })();
    const open_url = new URL(`http://${app_host}`);
    open_url.searchParams.set("token", token);
    open_url.pathname = `${base_path}${pathname}`;
    openInBrowser(open_url.toString());
    return {};
  }
}

