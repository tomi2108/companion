import { ExecutionContext } from "@lib/ctx";
import { RuntimeConfig } from "@lib/runtime";

type BaseType = "string" | "number" | "boolean" | "object";
export type ConfigHelp = {
  key: string;
  description: string;
  type: BaseType | `${BaseType}[]`;
};

export interface ConfigSection {
  key: string;
  setup(ctx: ExecutionContext): Promise<object> | void;
  validate(config: unknown): object;
  help?(): ConfigHelp[];
  defaults?(): Record<string, unknown>;
  applyRuntime?(runtime: RuntimeConfig, getKey: (k: string) => unknown): void;
}
