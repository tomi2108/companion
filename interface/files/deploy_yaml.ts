import path from "node:path";

import { DeployYamlContent, DeployYamlContentSchema } from "@files/validations";
import { ENVS } from "@lib/constants";

import { InvalidDeployYaml } from "./errors";
import { File } from "./file";
import { YamlFile } from "./yaml_file";

export class DeployYaml extends YamlFile<DeployYamlContent> {
  namespace: string;

  static isDeployYamlFile(file: File<unknown>) {
    return file.name().includes("values-")
      && file.name().includes("yaml");
    // && ENVS.some((e) => file.name.includes(e))
  }

  override validate(content: unknown) {
    try {
      DeployYamlContentSchema.parse(content);
    } catch (err) {
      console.error(err);
      throw new InvalidDeployYaml(this.path);
    }
  }

  constructor(file_path: string) {
    super(file_path);
    this.namespace = path.basename(file_path, ".yaml").replaceAll("values-", "");
  }

  setVersion(version: string) {
    const content = this.read();
    content["helm-chart-master"].image.tag = version;
    this.write(content);
  }

  private fillGaps(key: "secrets" | "configmaps") {
    const values = Object.values(this.content[key] ?? {});
    this.content[key] = Object.fromEntries(values.map((v, i) => [`${key.slice(0, -1) + (i + 1)}`, v]));
  }

  setSecret(name: string) {
    const content = this.read();

    if (!content["helm-chart-master"].secrets) content["helm-chart-master"].secrets = {};
    const secrets = content["helm-chart-master"].secrets = {};
    const values = Object.values(secrets);
    if (values.includes(name)) return;
    const i = values.length;
    content["helm-chart-master"].secrets[`secret${i + 1}`] = name;
    this.fillGaps("secrets");
  }

  removeConfigMap(name: string) {
    const entries = Object.entries(this.content.configmaps ?? {});
    const filtered_entries = entries.filter(([, value]) => value !== name);
    this.content.configmaps = Object.fromEntries(filtered_entries);
    this.fillGaps("configmaps");
  }

  setConfigMap(name: string) {
    const values = Object.values(this.content.configmaps ?? {});
    if (values.includes(name)) return;
    const i = values.length;
    if (!this.content.configmaps) this.content.configmaps = {};
    this.content.configmaps[`configmap${i + 1}`] = name;
    this.fillGaps("configmaps");
  }

  getVersion() {
    return this.read()["helm-chart-master"].image.tag;
  }

  getEnv() {
    return ENVS.find((e) => path.basename(this.path).includes(e)) ?? "prod";
  }
}

