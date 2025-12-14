import { getApp } from "@files";
import { InvalidHttpFile } from "@files/errors";
import { HttpFileContent, HttpFormatter } from "@files/formatters/http_formatter";
import { ObjectFile } from "@files/object_file";

import { Req } from "./req";
import { Config, ConfigError } from "../../lib/config";

export class HttpFile extends ObjectFile<HttpFileContent> {
  service: string;

  constructor(file_path: string) {
    super(file_path, new HttpFormatter());
    const namespace_prefix = Config.get().openshift.namespace_prefix;
    if (!namespace_prefix) throw new ConfigError("openshift.namespace_prefix");
    // TODO: I hate the idea of having http files linked to a particular service, find a better way
    const service = this.getVariables().host?.split(`-${namespace_prefix}`)?.[0];
    if (!service) throw new InvalidHttpFile(file_path, "Could not find host variable to determine service name");
    this.service = service;
  }

  getVariables() {
    return this.read().variables;
  }

  getRequests() {
    return this.read().requests.map((r) => new Req(r));
  }

  async getInfo() {
    const { app_repo } = await getApp(this.service);
    if (!app_repo) throw new Error(`Could not find app_repo for app ${this.service}`);
    const description = app_repo.getPackage().description;
    const version = app_repo.getPackage().version ?? "1.0.0";
    return { description, version };
  }
}
