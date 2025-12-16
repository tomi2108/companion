import z from "zod/v4";

import { InvalidThreescaleYaml } from "@files/errors";

import { YamlFormatter } from "./yaml_formatter";

const ThreescaleYamlContentSchema = z.object({
  kind: z.string(),
  metadata: z.object({ name: z.string() }),
  type: z.string(),
  specs: z.object({
    backend: z.object({
      "deployment-name": z.string(),
      "http-methods": z.string(),
      pattern: z.string(),
      environment: z.string(),
      path: z.string(),
      description: z.string().optional(),
      namespace: z.string()
    }),
    product: z.object({
      "system-name": z.string()
    })
  })
});

export type ThreescaleYamlContent = z.infer<typeof ThreescaleYamlContentSchema>;

export class ThreescaleYamlFormatter extends YamlFormatter<ThreescaleYamlContent> {

  protected override validate(content: unknown): void {
    ThreescaleYamlContentSchema.parse(content);
  }

  override exception(path: string): Error | void {
    return new InvalidThreescaleYaml(path);
  }
}
