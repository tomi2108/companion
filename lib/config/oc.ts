import z from "zod/v4";

import { DeployYamlContentSchema } from "@files/formatters/deploy_yaml_formatter";
import { APP_TYPES } from "@lib/constants";
import { ExecutionContext } from "@lib/ctx";

import { IntegrationConfig } from "./interface";

const schema = z.object({
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

type Schema = z.infer<typeof schema>;

export class OpenShiftConfig implements IntegrationConfig, Schema {
  username: Schema["username"] = "";
  password: Schema["password"] = "";
  server_name = process.env.DUX_OC_SERVER_NAME ?? "";
  auth_server_cuyo = process.env.DUX_OC_AUTH_SERVER_CUYO ?? "";
  auth_server_barracas = process.env.DUX_OC_AUTH_SERVER_BARRACAS ?? "";
  server_cuyo = process.env.DUX_OC_SERVER_CUYO ?? "";
  server_barracas = process.env.DUX_OC_SERVER_BARRACAS ?? "";
  namespace_prefix?: Schema["namespace_prefix"];
  mf_host_template?: Schema["mf_host_template"];
  project?: Schema["project"];
  product?: Schema["product"];
  default_ms_type: Schema["default_ms_type"];
  deployments: Schema["deployments"];
  mock_secrets: Schema["mock_secrets"];

  validate(config: unknown) {
    return schema.parse(config);
  }

  prod() {
    this.server_name = process.env.DUX_PROD_OC_SERVER_NAME ?? "";
    this.server_cuyo = process.env.DUX_PROD_OC_SERVER_CUYO ?? "";
    this.auth_server_cuyo = process.env.DUX_PROD_OC_AUTH_SERVER_CUYO ?? "";
  }

  async setup(ctx: ExecutionContext) {
    const username = await ctx.ui.input({ message: "Enter Openshift username" });
    const oc_password = await ctx.ui.password({ message: "Enter Openshift password" });
    return { username, password: oc_password };
  }

}
