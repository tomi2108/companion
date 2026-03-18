import z from "zod/v4";

import { DeployYamlContentSchema } from "@files/formatters/deploy_yaml_formatter";
import { APP_TYPES } from "@lib/constants";
import { ExecutionContext } from "@lib/ctx";
import { RuntimeConfig } from "@lib/runtime";

import { ConfigHelp, ConfigSection } from "./interface";

const schema = z.object({
  server_name: z.string(),
  auth_server_cuyo: z.string(),
  auth_server_barracas: z.string(),
  server_cuyo: z.string(),
  server_barracas: z.string(),
  cron_image_url: z.string(),
  prod_server_name: z.string(),
  prod_server_cuyo: z.string(),
  prod_auth_server_cuyo: z.string(),
  namespace_prefix: z.string().optional(),
  mf_host_template: z.string().optional(),
  project: z.string().optional(),
  product: z.string().optional(),
  default_ms_type: z.enum(APP_TYPES).optional(),
  mock_secrets: z.array(z.string()).optional(),
  deployments: z.record(
    z.enum(APP_TYPES), z.record(z.string(), DeployYamlContentSchema.partial().optional()).optional()
  ).or(
    z.record(
      z.string(), z.record(z.enum(APP_TYPES), DeployYamlContentSchema.partial().optional()).optional()
    )
  ).or(DeployYamlContentSchema.partial())
    .and(
      z.object({
        exclude: z.array(z.string()).optional()
      })
    ).optional(),
  username: z.string(),
  password: z.string()
});

export class OpenShiftConfig implements ConfigSection {
  key = "openshift";

  defaults(): Record<string, unknown> {
    return {
      server_name: process.env.MARO_OC_SERVER_NAME ?? "",
      auth_server_cuyo: process.env.MARO_OC_AUTH_SERVER_CUYO ?? "",
      auth_server_barracas: process.env.MARO_OC_AUTH_SERVER_BARRACAS ?? "",
      server_cuyo: process.env.MARO_OC_SERVER_CUYO ?? "",
      server_barracas: process.env.MARO_OC_SERVER_BARRACAS ?? "",
      cron_image_url: process.env.MARO_CRON_IMAGE_URL ?? "",
      prod_server_name: process.env.MARO_PROD_OC_SERVER_NAME ?? "",
      prod_server_cuyo: process.env.MARO_PROD_OC_SERVER_CUYO ?? "",
      prod_auth_server_cuyo: process.env.MARO_PROD_OC_AUTH_SERVER_CUYO ?? ""
    };
  }

  validate(config: unknown) {
    return schema.parse(config);
  }

  help(): ConfigHelp[] {
    return [
      { key: "server_name", description: "OpenShift server name", type: "string" },
      { key: "auth_server_cuyo", description: "CUYO OpenShift OAuth server URL", type: "string" },
      { key: "auth_server_barracas", description: "BARRACAS OpenShift OAuth server URL", type: "string" },
      { key: "server_cuyo", description: "CUYO cluster API server address", type: "string" },
      { key: "server_barracas", description: "BARRACAS cluster API server address", type: "string" },
      { key: "cron_image_url", description: "Image URL used in cronjobs", type: "string" },
      { key: "prod_server_name", description: "Production OpenShift server name", type: "string" },
      { key: "prod_server_cuyo", description: "Production OpenShift CUYO API server address", type: "string" },
      { key: "prod_auth_server_cuyo", description: "Production CUYO OpenShift OAuth server URL", type: "string" },
      { key: "namespace_prefix", description: "Prefix applied to namespaces", type: "string" },
      { key: "mf_host_template", description: "Template used to build MF host names", type: "string" },
      { key: "project", description: "Project used to create apps", type: "string" },
      { key: "product", description: "Product label value for deployments", type: "string" },
      { key: "default_ms_type", description: "Default microservice type", type: "string" },
      { key: "mock_secrets", description: "Secrets that determine whether a service is mocked", type: "string[]" },
      { key: "deployments", description: "Deployment overrides configuration", type: "object" },
      { key: "deployments.exclude", description: "Deployments excluded from processing", type: "string[]" },
      { key: "username", description: "OpenShift username", type: "string" },
      { key: "password", description: "OpenShift password", type: "string" }
    ];
  }

  applyRuntime(runtime: RuntimeConfig, getKey: (k: string) => unknown) {
    if (runtime.prod) return {
      server_name: getKey("prod_server_name"),
      server_cuyo: getKey("prod_server_cuyo"),
      auth_server_cuyo: getKey("prod_auth_server_cuyo")
    };
    return {};
  }

  async setup(ctx: ExecutionContext) {
    const username = await ctx.ui.input({ message: "Enter Openshift username" });
    const oc_password = await ctx.ui.password({ message: "Enter Openshift password" });
    return { username, password: oc_password };
  }

}
