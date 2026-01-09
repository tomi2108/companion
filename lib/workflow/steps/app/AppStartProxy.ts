import httpProxy from "http-proxy";
import http from "node:http";

import { AppRepo } from "@interface/dirs/app_repo";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = {
  apps: { app: AppRepo; port: number }[];
};
type Writes = {};
type Options = { port: number };

export class AppStartProxy extends WorkflowStep<Reads> {

  constructor(override options: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(_: ExecutionContext, reads: Reads) {
    const proxy = httpProxy.createProxyServer({});
    http.createServer(async (req, res) => {
      for (const { app, port } of reads.apps) {
        const { name } = await app.getInfo();
        if (req.url?.includes(name)) {
          const new_url = `/${req.url.split("/").slice(2).join("/")}`;
          req.url = new_url;
          proxy.web(req, res, { target: `http://localhost:${port}` });
          return;
        }
      }
      res.statusCode = 404;
      res.end();
    }).listen(this.options.port);

    return {};
  }
}
