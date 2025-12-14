import fs from "node:fs";
import path from "node:path";

import { FileNotFound } from "./errors";
import { TextFile } from "./text_file";

export class Dir {
  readonly path: string;

  constructor(path: string) {
    this.path = path;
  }

  name() {
    return path.basename(this.path);
  }

  sub(...dir_name: string[]) {
    return new Dir(path.join(this.path, ...dir_name));
  }

  readFiles() {
    return fs.readdirSync(this.path, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => new TextFile(path.join(d.parentPath, d.name)));
  }

  readDirs() {
    const ignore = [".git"];
    if (!fs.existsSync(this.path)) return [];
    return fs.readdirSync(this.path, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .filter((d) => !ignore.includes(d.name))
      .map((d) => new Dir(path.join(d.parentPath, d.name)));
  }

  getFile(name: string) {
    const file_path = path.join(this.path, name);
    if (!fs.existsSync(file_path)) throw new FileNotFound(file_path);
    return new TextFile(file_path);
  }

  create() {
    const exists = fs.existsSync(this.path);
    if (!exists) fs.mkdirSync(this.path, { recursive: true });
    return { created: !exists };
  }

  createFile(file_name: string) {
    const file_path = path.join(this.path, file_name);
    if (fs.existsSync(file_path)) fs.rmSync(file_path);
    return new TextFile(file_path);
  }

  join(dir: Dir) {
    return new Dir(this.path).sub(dir.path);
  }

  exists() {
    return fs.existsSync(this.path);
  }

  delete() {
    if (this.exists()) fs.rmSync(this.path);
  }

  toChoice() {
    return { name: this.name() };
  }

}

