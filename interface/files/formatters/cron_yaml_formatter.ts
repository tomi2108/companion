import z from "zod/v4";

import { InvalidCronYaml } from "@files/errors";

import { YamlFormatter } from "./yaml_formatter";

const CronYamlContentSchema = z.object({
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

export type CronYamlContent = z.infer<typeof CronYamlContentSchema>;
export type Container = CronYamlContent["spec"]["jobTemplate"]["spec"]["template"]["spec"]["containers"][number];
export class CronYamlFormatter extends YamlFormatter<CronYamlContent> {

  protected override validate(content: unknown): void {
    CronYamlContentSchema.parse(content);
  }

  override exception(path: string): Error | void {
    return new InvalidCronYaml(path);
  }
}
