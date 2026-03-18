import { Config } from "@lib/config";
import { mapObject } from "@lib/utils";

import { EnvFileContent, EnvFormatter } from "./formatters/env_formatter";
import { ObjectFile } from "./object_file";

export function toExternalEnv(str: string) {
  const config = Config.getView().get("openshift");
  return str
    .replaceAll(`.${config.namespace_prefix}`, `-${config.namespace_prefix}`)
    .replaceAll(".svc.cluster.local:8080", `.apps.${config.server_name}`);
}

export function toInternalEnv(str: string) {
  const config = Config.getView().get("openshift");
  return str
    .replaceAll(`-${config.namespace_prefix}`, `.${config.namespace_prefix}`)
    .replaceAll(`.apps.${config.server_name}`, ".svc.cluster.local:8080");
}

export class EnvFile extends ObjectFile<EnvFileContent> {

  constructor(path: string) {
    super(path, new EnvFormatter());
  }

  override writePartial(partial: { [x: string]: string | number | undefined }): void {
    if (!this.exists()) this.write({});
    super.writePartial(partial);
  }

  add(key: string, value: string | number) {
    this.writePartial({ [key]: value });
  }

  remove(key: string) {
    const content = this.read();
    if (!(key in content)) return;
    this.writePartial({ [key]: undefined });
  }

  external() {
    const content = this.read();
    const replaced = mapObject(content, ([key, value]) => [key, toExternalEnv(String(value))]);
    this.write(replaced);
  }

  internal() {
    const content = this.read();
    const replaced = mapObject(content, ([key, value]) => [key, toInternalEnv(String(value))]);
    this.write(replaced);
  }

}
