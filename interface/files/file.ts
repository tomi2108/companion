import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { FileNotFound } from "./errors";
import { FileFormatter } from "./formatters";

export class File<T = any> {
  readonly path: string;
  formatter: FileFormatter<T>;

  dir() {
    return path.dirname(this.path);
  }

  copy(to: File<unknown>) {
    fs.copyFileSync(this.path, to.path);
  }

  write(input: T) {
    const formatted = this.formatter.toString(input).trim();
    fs.writeFileSync(this.path, formatted);
  }

  read(): T {
    if (!this.exists()) throw new FileNotFound(this.path);

    try {
      const content = fs.readFileSync(this.path).toString().trim();
      return this.formatter.fromString(content);
    } catch (err) {
      const exception = this.formatter.exception(this.path);
      if (exception) throw exception;
      throw err;
    }
  }

  constructor(file_path: string, formatter: FileFormatter<T>) {
    this.path = file_path;
    this.formatter = formatter;
  }

  name({ extension } = { extension: true }) {
    const { name, ext } = path.parse(this.path);
    if (extension) return `${name}${ext}`;
    return name;
  }

  appendLine(content: string) {
    fs.appendFileSync(this.path, `${content}\n`);
  }

  exists() {
    return fs.existsSync(this.path);
  }

  delete() {
    if (this.exists()) fs.rmSync(this.path);
  }

  replace(from: string | RegExp, to: string) {
    const content = fs.readFileSync(this.path, "utf8");

    const regex
      = from instanceof RegExp
        ? new RegExp(from.source, from.flags.includes("g") ? from.flags : from.flags + "g")
        : new RegExp(from.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`), "gms");

    fs.writeFileSync(this.path, content.replace(regex, to), "utf8");
  }

  getMd5() {
    const content = fs.readFileSync(this.path);
    const hash = crypto.createHash("md5");
    hash.update(content);
    return hash.digest("hex");
  }

  toChoice() {
    return { name: this.name() };
  }

  toString() {
    return this.path;
  }
}

