import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import openEditor from "open-editor";

import { Config } from "@lib/config";

import { FileNotFound } from "./errors";

export abstract class File<T> {
  readonly path: string;

  abstract write(input: T): void;
  abstract read(): T;

  constructor(file_path: string) {
    this.path = file_path;
  }

  name({ extension } = { extension: true }) {
    const { name, ext } = path.parse(this.path);
    if (extension) return `${name}${ext}`;
    return name;
  }

  protected readString() {
    try {
      return fs.readFileSync(this.path).toString();
    } catch {
      throw new FileNotFound(this.path);
    }
  }

  protected writeString(content: string): void {
    fs.writeFileSync(this.path, content);
  }

  append(content: string) {
    fs.appendFileSync(this.path, content);
  }

  insertLine(lineNo: number, line: string) {
    const lines = fs.readFileSync(this.path).toString().split("\n");
    lines.splice(lineNo - 1, 0, line);
    fs.writeFileSync(this.path, lines.join("\n"));
  }

  async openInEditor(opts: { wait?: boolean } = {}) {
    await openEditor(
      [{ file: this.path }],
      { wait: opts?.wait ?? false, editor: Config.get().preferences.editor }
    );
  }

  getMd5() {
    const content = fs.readFileSync(this.path);
    const hash = crypto.createHash("md5");
    hash.update(content);
    return hash.digest("hex");
  }

  toChoice() {
    return { name: this.name };
  }
}

