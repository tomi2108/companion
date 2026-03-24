export const APP_TYPES = ["fcd", "int", "dao", "app", "crn", "wrk"] as const;

export type AppType = typeof APP_TYPES[number];

export type Version = VersionNumber | VersionBeta;
export type VersionNumber = `v${number}.${number}.${number}`;
export type VersionBeta = `${VersionNumber}-beta.${number}`;
export type VersionRC = `${VersionNumber}-rc.${number}`;

export type Choice = {
  name: string;
  hint?: string;
  value?: unknown;
  disabled?: boolean;
};
