import yaml from "js-yaml";
import fs, { Dirent } from "node:fs";

import { ConfigMap } from "@oc/configmap";
import { Secret } from "@oc/secret";

import { YamlFile } from "./yaml_file";
import { AppRepo } from "../dirs/app_repo";
import { Container, CronYamlContent, CronYamlFormatter } from "./formatters/cron_yaml_formatter";

export class CronYaml extends YamlFile<CronYamlContent> {
  static isCronYaml(file: Dirent) {
    return file.isFile() && file.name.includes("cronjob");
  }

  static create(file_path: string) {
    if (fs.existsSync(file_path)) throw new Error(`${file_path} already exists, cannot create cron yaml`);
    const initial_cron_yaml = {
      apiVersion: "batch/v1",
      kind: "CronJob",
      metadata: {
        name: "new-cron",
        namespace: ""
      },
      spec: {
        schedule: "* * * * *",
        jobTemplate: {
          spec: {
            template: {
              spec: {
                containers: [
                  {
                    name: "new-cron",
                    image: "harbor.agil.movistar.com.ar/paas-digitales/:version",
                    args: ["npm", "start"]
                  }
                ],
                restartPolicy: "OnFailure"
              }
            }
          }
        }
      }
    };
    fs.writeFileSync(file_path, yaml.dump(initial_cron_yaml));
    return new CronYaml(file_path);
  }

  constructor(path: string) {
    super(path, new CronYamlFormatter());
  }

  private setContainer(partial_update: Partial<Container>) {
    const new_container = { ...this.getContainer(), ...partial_update };
    this.writePartial({ spec: { jobTemplate: { spec: { template: { spec: { containers: [new_container] } } } } } });
  }

  private getContainer() {
    const container = this.read().spec.jobTemplate.spec.template.spec.containers[0];
    if (!container) throw new Error(`Missing container in cron yaml ${this.path}`);
    return container;
  }

  addSecret(secret: Secret) {
    const envs = this.getContainer().envFrom ?? [];
    this.setContainer({ envFrom: [...envs, { secretRef: { name: secret.name } }] });
  }

  addConfigmap(configmap: ConfigMap) {
    const envs = this.getContainer().envFrom ?? [];
    this.setContainer({ envFrom: [...envs, { configMapRef: { name: configmap.name } }] });
  }

  setVersion(version: string) {
    const [url] = this.getContainer().image.split(":");
    this.setContainer({ image: [url, version].join(":") });
  }

  async setDeployment(app_repo: AppRepo) {
    const [url, version] = this.getContainer().image.split(":");
    const splitted = url?.split("/");
    const path = splitted?.slice(0, -1);
    const { name } = await app_repo.getInfo();
    const new_url = `${path?.join("/")}/${name}:${version}`;
    this.setContainer({ image: new_url });
  }

  setNameSpace(namespace: string) {
    this.writePartial({ metadata: { namespace } });
  }

  setName(name: string) {
    this.writePartial({ metadata: { name } });
  }

  getName() {
    return this.read().metadata.name;
  }

  setSchedule(schedule: string) {
    this.writePartial({ spec: { schedule } });
  }

  getAppName() {
    const [url] = this.getContainer().image.split(":");
    const splitted = url?.split("/");
    return splitted?.at(-1);
  }

  getSchedule() {
    return this.read().spec.schedule;
  }
}
