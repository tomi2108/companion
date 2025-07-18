import yaml from "js-yaml";
import fs, { Dirent } from "node:fs";
import path from "node:path";

import { getDeploymentOption } from "@files/utils";
import { DeployYamlContent, YamlContentSchema } from "@files/validations";
import { Config } from "@lib/config";
import { AppType, ENVS } from "@lib/constants";
import { deepMerge, toYaml } from "@lib/utils";

export class DeployYaml {
  file_path: string;
  namespace: string;
  content: DeployYamlContent;

  static isDeployYamlFile(file: Dirent) {
    return file.isFile()
      // && ENVS.some((e) => file.name.includes(e))
      && file.name.includes("values-");
  }

  constructor(file_path: string) {
    const file_content = fs.readFileSync(file_path).toString();
    const yaml_content = (yaml.load(file_content) as { "helm-chart-master": any })?.["helm-chart-master"];
    if (!yaml_content) throw new InvalidDeployYaml(file_path);

    this.content
      = deepMerge(YamlContentSchema.parse(yaml_content, {
        error: () => {
          console.log(yaml_content);
          return file_path;
        }
      }), yaml_content);

    this.file_path = file_path;
    this.namespace = this.getNamespace();
  }

  async prepareDeploy(type: AppType) {
    const secrets_to_add = getDeploymentOption("secrets", type, this.namespace, this.content) ?? [];
    secrets_to_add.forEach((s: string) => this.setSecret(s));

    if (!this.content.dynatrace) this.content.dynatrace = {
      modulo: Config.get().dynatrace?.modulo ?? "NO_INFORMADO",
      tipo: type === "app" ? "MICROFRONTEND" : type.toUpperCase(),
      clave_jira: Config.get().jira?.project_key ?? "NO_INFORMADO",
      issue_jira: "NO_INFORMADO",
      masivo_critico: "NO"
    };

    this.content.route.enabled = getDeploymentOption("route.enabled", type, this.namespace, this.content);

    this.content.resources.limits.cpu = getDeploymentOption("resources.limits.cpu", type, this.namespace, this.content);
    this.content.resources.limits.memory = getDeploymentOption("resources.limits.memory", type, this.namespace, this.content);

    this.content.resources.requests.cpu = getDeploymentOption("resources.requests.cpu", type, this.namespace, this.content);
    this.content.resources.requests.memory = getDeploymentOption("resources.requests.memory", type, this.namespace, this.content);

    this.content.autoscaling.enabled = getDeploymentOption("autoscaling.enabled", type, this.namespace, this.content);
    this.content.autoscaling.minReplicas = getDeploymentOption("autoscaling.minReplicas", type, this.namespace, this.content);
    this.content.autoscaling.maxReplicas = getDeploymentOption("autoscaling.maxReplicas", type, this.namespace, this.content);

    this.content.readinessProbe.enabled = getDeploymentOption("readinessProbe.enabled", type, this.namespace, this.content);

    this.content.configmapENV.ELK_LOGS = getDeploymentOption("configmapENV.ELK_LOGS", type, this.namespace, this.content);
    this.content.configmapENV.ELK_LOGS_DEBUG = getDeploymentOption("configmapENV.ELK_LOGS_DEBUG", type, this.namespace, this.content);
    this.content.configmapENV.STDOUT_LOGS = getDeploymentOption("configmapENV.STDOUT_LOGS", type, this.namespace, this.content);

    this.content.labels.lproduct = Config.get().openshift.product ?? this.content.labels.lproduct;
    this.content.labels.lenvironment = this.getEnv();
    return this.content;
  }

  toString() {
    return toYaml({ "helm-chart-master": this.content });
  }

  save() {
    const string = this.toString();
    fs.writeFileSync(this.file_path, string);
  }

  setVersion(version: string) {
    this.content.image.tag = version;
  }

  private fillGaps(key: "secrets" | "configmaps") {
    const values = Object.values(this.content[key] ?? {});
    this.content[key] = Object.fromEntries(values.map((v, i) => [`${key.slice(0, -1) + (i + 1)}`, v]));
  }

  setSecret(name: string) {
    if (!this.content.secrets) this.content.secrets = {};
    const values = Object.values(this.content.secrets);
    if (values.includes(name)) return;
    const i = values.length;
    this.content.secrets[`secret${i + 1}`] = name;
    this.fillGaps("secrets");
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
    return this.content.image.tag;
  }

  getNamespace() {
    return path.basename(this.file_path, ".yaml").replaceAll("values-", "");
  }

  getEnv() {
    return ENVS.find((e) => path.basename(this.file_path).includes(e)) ?? "prod";
  }
}

export class InvalidDeployYaml extends Error {
  constructor(full_path: string) {
    super(`${full_path} is not a valid deploy yaml`);
  }
}
