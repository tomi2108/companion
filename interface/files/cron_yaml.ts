import yaml from "js-yaml";
import fs, { Dirent } from "node:fs";
import { z } from "zod/v4";

import { toYaml } from "@lib/utils";
import { ConfigMap } from "@oc/configmap";
import { Secret } from "@oc/secret";

import { AppRepo } from "../dirs/app_repo";

const YamlContentSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: z.object({
    name: z.string(),
    namespace: z.string()
  }),
  spec: z.object({
    schedule: z.string(),
    jobTemplate: z.object({
      spec: z.object({
        template: z.object({
          spec: z.object({
            restartPolicy: z.string(),
            containers: z.array(
              z.object({
                name: z.string(),
                image: z.string(),
                envFrom: z.array(z.object({
                  configMapRef: z.object({ name: z.string() }).optional(),
                  secretRef: z.object({ name: z.string() }).optional()
                })).optional(),
                args: z.array(z.string())
              }))
          })
        })
      })
    })
  })
});

type Content = z.infer<typeof YamlContentSchema>;
type Container = Content["spec"]["jobTemplate"]["spec"]["template"]["spec"]["containers"][number];

export class CronYaml {
  file_path: string;
  content: Content;

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

  constructor(file_path: string) {
    const file_content = fs.readFileSync(file_path).toString();
    const yaml_content = yaml.load(file_content);
    if (!yaml_content) throw new InvalidCronYaml(file_path);

    this.content = YamlContentSchema.parse(yaml_content);
    this.file_path = file_path;
  }

  private setContainer(partial_update: Partial<Container>) {
    this.content.spec.jobTemplate.spec.template.spec.containers[0] = { ...this.getContainer(), ...partial_update };
  }

  private getContainer() {
    if (!this.content.spec.jobTemplate.spec.template.spec.containers[0]) throw new Error(`missing container in cron job yaml ${this.file_path}`);
    return this.content.spec.jobTemplate.spec.template.spec.containers[0];
  }

  toString() {
    return toYaml(this.content);
  }

  save() {
    const string = this.toString();
    fs.writeFileSync(this.file_path, string);
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
    this.content.metadata.namespace = namespace;
  }

  setName(name: string) {
    this.content.metadata.name = name;
    this.setContainer({ name });
  }

  getName() {
    return this.content.metadata.name;
  }

  setSchedule(schedule: string) {
    this.content.spec.schedule = schedule;
  }

  getAppName() {
    const [url] = this.getContainer().image.split(":");
    const splitted = url?.split("/");
    return splitted?.at(-1);
  }

  getSchedule() {
    return this.content.spec.schedule;
  }

}

export class InvalidCronYaml extends Error {
  constructor(full_path: string) {
    super(`${full_path} is not a valid cron yaml`);
  }
}
