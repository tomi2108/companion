import { ConfigView } from "@lib/config/view";
import { ExecutionContext } from "@lib/ctx";

type Option = {
  name: string;
  type: "boolean" | "number" | "string";
  description?: string;
  aliases?: string[];
  conflicts?: string[];
};

type BaseCommand = {
  name: string;
  description?: string;
  aliases?: string[];
};

type NamespaceCommand = BaseCommand & {
  subcommands: Command[];
  run?: never;
  options?: never;
};

type ExecutableCommand = BaseCommand & {
  run(opts: {
    ctx: ExecutionContext;
    config: ConfigView;
    args: any;
  }): void | Promise<void>;
  options?: Option[];
};

export type Command = NamespaceCommand | ExecutableCommand;
