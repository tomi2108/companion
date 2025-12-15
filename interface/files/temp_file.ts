import crypto from "node:crypto";

import { Config } from "@lib/config";
import { openInEditor } from "@lib/editor";

import { Dir } from "./dir";
import { TextFile } from "./text_file";

export class TempFile extends TextFile {

  constructor({ content, ext }: { content?: string; ext?: string }) {
    const tmp_dir = new Dir(Config.get().preferences.tmp_path);
    tmp_dir.create();
    const extension = ext ? `.${ext}` : "";
    const name = `${crypto.randomUUID()}${extension}`;
    const file = tmp_dir.createFile(name);
    file.write(content ?? "");
    super(file.path);
  }

  async prompt() {
    const m1 = this.getMd5();
    openInEditor(this, { wait: true });
    const m2 = this.getMd5();
    const new_content = this.read();
    return { changed: m1 !== m2, new_content };
  }

  override read() {
    const content = super.read();
    this.delete();
    return content;
  }
}
