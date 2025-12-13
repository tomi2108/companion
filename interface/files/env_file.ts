import fs from "node:fs";

import { AppRepo } from "@interface/dirs/app_repo";
import { Config } from "@lib/config";
import { Project } from "@oc/project";

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

export class EnvFile {
  path: string;
  content: Record<string, string>;

  constructor(path: string) {
    this.path = path;
    const exists = fs.existsSync(path);
    const file_content = exists ? fs.readFileSync(path).toString().trim() : "";
    this.content = Object.fromEntries(file_content.split("\n").map((l) => l.trim().split("=")));
  }

  get() {
    return this.content;
  }

  add(key: string, value: string | number) {
    fs.appendFileSync(this.path, `${key}=${value}\n`);
  }

  set(newEnv: Record<string, string | number | undefined>) {
    if (fs.existsSync(this.path)) fs.rmSync(this.path);
    Object.entries(newEnv).forEach(([key, value]) =>
      value ? fs.appendFileSync(this.path, `${key}=${value}\n`) : null
    );
  }

  remove(key: string) {
    this.set({ ...this.content, [key]: undefined });
  }

  external() {
    if (!fs.existsSync(this.path)) return;
    const file_content = fs.readFileSync(this.path).toString();
    const replaced = toExternalEnv(file_content);
    fs.writeFileSync(this.path, replaced);
  }

  internal() {
    if (!fs.existsSync(this.path)) return;
    const file_content = fs.readFileSync(this.path).toString();
    const replaced = toInternalEnv(file_content);
    fs.writeFileSync(this.path, replaced);
  }

  async copy(project: Project, app_repo: AppRepo) {
    const { name } = await app_repo.getInfo();
    const deployment = await project.getDeployment(name);
    const configMaps = await deployment.getConfigMaps() ?? [];
    const secrets = deployment.getSecrets() ?? [];

    if (fs.existsSync(this.path)) fs.rmSync(this.path);
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
