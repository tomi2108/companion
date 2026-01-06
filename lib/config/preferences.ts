import path from "node:path";
import z from "zod/v4";

import { ExecutionContext } from "@lib/ctx";

import { IntegrationConfig } from "./interface";

const schema = z.object({
  logs_path: z.string().optional(),
  editor: z.string().optional(),
  browser: z.string().optional()
});

const root = path.dirname(require.main?.filename || process.mainModule?.filename || __filename);
const default_log_path = path.join(root, "../../logs");
const default_tmp_dir = path.join(root, "/tmp");
const default_editor = process.env.EDITOR ?? "vim";
const default_browser = process.env.BROWSER ?? "firefox";

type Schema = z.infer<typeof schema>;

export class PreferencesConfig implements IntegrationConfig, Schema {
  logs_path = default_log_path;
  tmp_path = default_tmp_dir;
  editor = default_editor;
  browser = default_browser;

  validate(config: unknown) {
    if (!config) return {};
    return schema.parse(config);
  }

  async setup(ctx: ExecutionContext) {
    const editor = await ctx.ui.input({ message: "What is your favourite editor? (code, nvim, vim, nano)", initial: this.editor ?? default_editor });
    const browser = await ctx.ui.input({ message: "What is your favourite browser? (google-chrome, firefox, brave-browser, qutebrowser)", initial: this.browser ?? default_browser });
    const logs_path = await ctx.ui.input({ message: "Where do you store log files?", initial: this.logs_path ?? default_log_path });
    return { editor, browser, logs_path };
  }

}
