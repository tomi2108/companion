import { Dependency } from "@interface/dirs/app_repo";
import { AppType } from "@lib/constants";

export const IntConnections = {
  apigw: "apigw",
  digit3: "digit3"
} as const;

export const DaoConnections = {
  sql: "sql",
  mongo: "mongo"
} as const;

export type IntConnection = typeof IntConnections[keyof typeof IntConnections];
export type DaoConnection = typeof DaoConnections[keyof typeof DaoConnections];
export type Connection = DaoConnection | IntConnection;

export const s3Dependencies: Dependency[] = [{ name: "@aws-sdk/client-s3" }, { name: "@aws-sdk/node-http-handler" }];
export const amqDependencies: Dependency[] = [{ name: "rhea-promise" }];

export const dependenciesMap: Record<AppType, Dependency[] | Partial<Record<Connection, Dependency[]>>> = {
  app: [],
  wrk: amqDependencies,
  dao: {
    [DaoConnections.mongo]: [{ name: "mongoose" }],
    [DaoConnections.sql]: [{ name: "sequelize" }]
  },
  crn: [],
  fcd: [{ name: "axios", version: "0.21.4" }],
  int: {
    [IntConnections.apigw]: [{ name: "axios", version: "0.21.4" }],
    [IntConnections.digit3]: [{ name: "axios", version: "0.21.4" }]
  }
};
