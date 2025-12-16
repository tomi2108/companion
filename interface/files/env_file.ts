
import { AppRepo } from "@interface/dirs/app_repo";
import { Config } from "@lib/config";
import { mapObject } from "@lib/utils";
import { Project } from "@oc/project";

import { EnvFileContent, EnvFormatter } from "./formatters/env_formatter";
import { ObjectFile } from "./object_file";

export function toExternalEnv(str: string) {
  const config = Config.get().openshift;
  return str
    .replace(new RegExp(`.${config.namespace_prefix}`, "g"), `-${config.namespace_prefix}`)
    .replace(/\.svc\.cluster\.local:8080/g, `.apps.${config.server_name}.cuyorh.tcloud.ar`);
}

export function toInternalEnv(str: string) {
  const config = Config.get().openshift;
  return str
    .replaceAll(new RegExp(`-${config.namespace_prefix}`, "g"), `.${config.namespace_prefix}`)
    .replaceAll(/\.apps\..*\.cuyorh\.tcloud\.ar/g, ".svc.cluster.local:8080");
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

  async copy(project: Project, app_repo: AppRepo) {
    const { name } = await app_repo.getInfo();
    const deployment = await project.getDeployment(name);
    const configMaps = await deployment.getConfigMaps() ?? [];
    const secrets = deployment.getSecrets() ?? [];
    this.delete();

    for (const r of [...secrets, ...configMaps]) {
      for (const [key, value] of Object.entries(await r.getData() ?? {})) {
        this.add(key, value);
      }
    }

    const extraEnvs = {
      STDOUT_LOGS: "on"
    };

    Object.entries(extraEnvs).forEach(([key, value]) => {
      this.remove(key);
      this.add(key, value);
    });
  }
}
