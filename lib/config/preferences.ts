import path from "node:path";
import z from "zod/v4";

import { ExecutionContext } from "@lib/ctx";

import { ConfigHelp, ConfigSection } from "./interface";

const schema = z.object({
  logs_path: z.string().optional(),
  editor: z.string().optional(),
  browser: z.string().optional(),
  git_provider: z.enum(["gitlab", "github"]).optional()
});

export const root = path.resolve(path.dirname(require.main?.filename || process.mainModule?.filename || __filename), "..");
const default_log_path = path.join(root, "../../logs");
const default_tmp_dir = path.join(root, "/tmp");
const default_editor = process.env.EDITOR ?? "vim";
const default_browser = process.env.BROWSER ?? "firefox";

export class PreferencesConfig implements ConfigSection {
  key = "preferences";
  logs_path = default_log_path;
  editor = default_editor;
  browser = default_browser;

  defaults(): Record<string, unknown> {
    return {
      tmp_path: default_tmp_dir,
      logs_path: this.logs_path,
      editor: this.editor,
      browser: this.browser,
      git_provider: "gitlab" as const
    };
  }

  help(): ConfigHelp[] {
    return [
      { key: "tmp_path", description: "Directory for temporary files", type: "string" },
      { key: "logs_path", description: "Directory for log files", type: "string" },
      { key: "editor", description: "Default editor command", type: "string" },
      { key: "browser", description: "Default browser command", type: "string" },
      { key: "git_provider", description: "Git provider used by default", type: "string" }
    ];
  }

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
