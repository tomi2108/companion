export const APP_TYPES = ["fcd", "int", "dao", "bau", "app", "crn", "wrk"] as const;
export const ENVS = ["dev", "int", "cert"] as const;
export const EXCLUDED_SECRETS = ["elasticsearch"];

export type AppType = typeof APP_TYPES[number];
export type Env = typeof ENVS[number];

export type Version = VersionNumber | VersionBeta | VersionNumber;
export type VersionNumber = `v${number}.${number}.${number}`;
export type VersionBeta = `${VersionNumber}-beta.${number}`;
export type VersionRC = `${VersionNumber}-rc.${number}`;

export type Choice = {
  name: string;
  hint?: string;
  value?: unknown;
  disabled?: boolean;
};
