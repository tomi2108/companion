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

  exists() {
    return fs.existsSync(this.path);
  }

  delete() {
    if (this.exists()) fs.rmSync(this.path);
  }

  insertLine(lineNo: number, line: string) {
    const lines = this.readString().split("\n");
    lines.splice(lineNo - 1, 0, line);
    this.writeString(lines.join("\n"));
  }

  removeLine(lineNo: number) {
    const lines = this.readString().split("\n");
    lines.splice(lineNo - 1, 1);
    this.writeString(lines.join("\n"));
  }

  replace(from: string, to: string) {
    const content = this.readString();
    const updated = content.replace(new RegExp(from, "g"), to);
    this.writeString(updated);
  }

  async openInEditor(opts: { wait?: boolean } = {}) {
    await openEditor(
      [{ file: this.path }],
      { wait: opts?.wait ?? false, editor: Config.get().preferences.editor }
    );
  }

  getMd5() {
    const content = this.readString();
    const hash = crypto.createHash("md5");
    hash.update(content);
    return hash.digest("hex");
  }

  toChoice() {
    return { name: this.name() };
  }
}

