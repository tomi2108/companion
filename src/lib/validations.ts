import { z } from "zod/v4";
import { MS_TYPES } from "./constants";

export const PathsConfigSchema = z.object({
  despliegues: z.string().optional(),
  frontend: z.string().optional(),
  backend: z.string().optional(),
  "3scale": z.string().optional(),
  argocd: z.string().optional(),
  vault: z.string().optional()
});

export const OpenShiftConfigSchema = z.object({
  default_ms_type: z.enum(MS_TYPES).optional(),
  deployments: z.record(
    z.enum(MS_TYPES), z.record(z.string(), z.object().optional()).optional()
    //                            TODO: type this ^^ yaml content
  ).or(
    z.record(
      z.string(), z.record(z.enum(MS_TYPES), z.object().optional()).optional()
      //                            TODO: type this ^^ yaml content
    )
  ).and(
    z.object({
      exclude: z.array(z.string()).optional()
    })
  ).optional(),
  username: z.string(),
  password: z.string()
});

export const PreferencesConfigSchema = z.object({
  logs_path: z.string().optional(),
  editor: z.string().optional(),
  browser: z.string().optional()
});

export const DynatraceConfigSchema = z.object({
  modulo: z.string().optional()
});

export const GitlabConfigSchema = z.object({
  token: z.string(),
  username: z.string(),
  default_reviewer: z.string().optional()
});

export const JiraConfigSchema = z.object({
  project_key: z.string().optional(),
  username: z.string(),
  token: z.string(),
  labels: z.array(z.string()).optional(),
  board_id: z.number().optional()
});

export const VaultConfigSchema = z.object({
  token: z.string()
});

export const ThreescaleConfigSchema = z.object({
  products: z.record(z.string(), z.string())
});

export const ConfigSchema = z.object({
  team: z.string().optional(),
  paths: PathsConfigSchema,
  gitlab: GitlabConfigSchema,
  jira: JiraConfigSchema,
  dynatrace: DynatraceConfigSchema.optional(),
  openshift: OpenShiftConfigSchema,
  vault: VaultConfigSchema,
  preferences: PreferencesConfigSchema.optional(),
  threescale: ThreescaleConfigSchema.optional()
});

type UserJiraConfig = z.infer<typeof JiraConfigSchema>;
type UserGitlabConfig = z.infer<typeof GitlabConfigSchema>;
type UserOpenShiftConfig = z.infer<typeof OpenShiftConfigSchema>;
type UserDynatraceConfig = z.infer<typeof DynatraceConfigSchema>;
type UserVaultConfig = z.infer<typeof VaultConfigSchema>;

export type PreferencesConfig = z.infer<typeof PreferencesConfigSchema>;
export type PathsConfig = z.infer<typeof PathsConfigSchema>;
export type ThreeScaleConfig = z.infer<typeof ThreescaleConfigSchema>;

export type JiraConfig = UserJiraConfig & {
  server: string;
};

export type OpenShiftConfig = UserOpenShiftConfig & {
  auth_server_cuyo: string;
  auth_server_barracas: string;
  server_cuyo: string;
  server_barracas: string;
  namespace_prefix?: string;
  mf_host_template?: string;
  project?: string;
  product: string;
};
export type DynatraceConfig = UserDynatraceConfig;
export type GitlabConfig = UserGitlabConfig & {
  server: string;
  repos: { [K in keyof PathsConfig]: number };
};

export type VaultConfig = UserVaultConfig & {
  project: string;
  server: string;
};
