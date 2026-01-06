import { ExecutionContext } from "@lib/ctx";

export interface IntegrationConfig {
  setup(ctx: ExecutionContext): Promise<object> | void;
  validate(config: unknown): object;
}
