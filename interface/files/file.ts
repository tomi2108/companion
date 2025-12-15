import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { FileNotFound } from "./errors";
import { FileFormatter } from "./formatters";

export class File<T> {
  readonly path: string;
  formatter: FileFormatter<T>;

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

  writeLine(content: string) {
    fs.appendFileSync(this.path, `${content}\n`);
  }

  exists() {
    return fs.existsSync(this.path);
  }

  delete() {
    if (this.exists()) fs.rmSync(this.path);
  }

  replace(from: string, to: string) {
    const content = fs.readFileSync(this.path).toString();
    const updated = content.replace(new RegExp(from, "g"), to);
    fs.writeFileSync(this.path, updated);
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

