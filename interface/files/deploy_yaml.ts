import path from "node:path";

import { ENVS } from "@lib/constants";

import { File } from "./file";
import { DeployYamlContent, DeployYamlFormatter } from "./formatters/deploy_yaml_formatter";
import { YamlFile } from "./yaml_file";

export class DeployYaml extends YamlFile<DeployYamlContent> {
  namespace: string;

  static isDeployYamlFile(file: File<unknown>) {
    return file.name().includes("values-")
      && file.name().includes("yaml");
    // && ENVS.some((e) => file.name.includes(e))
  }

  constructor(file_path: string) {
    super(file_path, new DeployYamlFormatter());
    this.namespace = path.basename(file_path, ".yaml").replaceAll("values-", "");
  }

  setVersion(version: string) {
    const content = this.read();
    content["helm-chart-master"].image.tag = version;
    this.write(content);
  }

  private fillGaps(key: "secrets" | "configmaps") {
    const content = this.read()["helm-chart-master"];
    const values = Object.values(content[key] ?? {});
    const newConfig = Object.fromEntries(values.map((v, i) => [`${key.slice(0, -1) + (i + 1)}`, v]));
    this.writePartial({ "helm-chart-master": { [key]: newConfig } });
  }

  setSecret(name: string) {
    const content = this.read();
    const secrets = content["helm-chart-master"].secrets ?? {};
    const i = Object.values(secrets).length;
    const key = i === 0 ? "secret1" : `secret${i + 1}`;
    const update = { "helm-chart-master": { secrets: { [key]: name } } };
    this.writePartial(update);
    this.fillGaps("secrets");
  }

  removeConfigMap(name: string) {
    const cms = this.read()["helm-chart-master"].configmaps;
    const entries = Object.entries(cms ?? {});
    const filtered_entries = entries.filter(([, value]) => value !== name);
    this.writePartial({ "helm-chart-master": { configmaps: Object.fromEntries(filtered_entries) } });
    this.fillGaps("configmaps");
  }

  setConfigMap(name: string) {
    const content = this.read();
    const configmaps = content["helm-chart-master"].configmaps ?? {};
    const i = Object.values(configmaps).length;
    const key = i === 0 ? "configmap1" : `configmap${i + 1}`;
    const update = { "helm-chart-master": { configmaps: { [key]: name } } };
    this.writePartial(update);
    this.fillGaps("configmaps");
  }

  getVersion() {
    return this.read()["helm-chart-master"].image.tag;
  }

  getEnv() {
    return ENVS.find((e) => this.namespace.includes(e)) ?? "prod";
  }

  override toChoice() {
    const version = this.getVersion();
    return {
      hint: version ? `Current: ${version}` : "Missing yaml",
      name: this.namespace
    };

  }
}

