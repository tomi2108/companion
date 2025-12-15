import fs from "node:fs";
import path from "node:path";
import openEditor from "open-editor";

import { Config } from "@lib/config";

import { FileNotFound } from "./errors";
import { File } from "./file";
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

  hasFile(name: string) {
    const file_path = path.join(this.path, name);
    return fs.existsSync(file_path);
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

  contains(file: File<unknown>) {
    const dirPath = path.resolve(this.path);
    const filePath = path.resolve(file.path);
    const dirWithSep = dirPath.endsWith(path.sep)
      ? dirPath
      : dirPath + path.sep;
    return filePath.startsWith(dirWithSep);
  }

  relativePathTo(file: File<unknown>): string | null {
    if (!this.contains(file)) return null;
    return path.relative(path.resolve(this.path), path.resolve(file.path));
  }

  getRelative(relativePath: string) {
    const files = this.traverse();
    const file = files.find((f) => this.relativePathTo(f) === relativePath);
    if (!file) throw new FileNotFound(path.join(this.path, relativePath));
    return file;
  }

  async openInEditor() {
    await openEditor([{ file: this.path }],
      { editor: Config.get().preferences.editor }
    );
  }

  traverse() {
    const ignore = [".git", "dist", "coverage", ".husky", ".next", "node_modules", "out", "build"];
    const result: Array<TextFile> = [];
    if (!this.exists()) return result;
    const walk = (dir: Dir) => {
      const entries = fs.readdirSync(dir.path, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir.path, entry.name);

        if (entry.isDirectory()) {
          if (ignore.includes(entry.name)) continue;
          walk(new Dir(fullPath));
        }
        if (entry.isFile()) {
          if (ignore.includes(entry.name)) continue;
          result.push(new TextFile(fullPath));
        }
      }
    };

    walk(this);
    return result;
  }

  toChoice() {
    return { name: this.name() };
  }

  toString() {
    return this.path;
  }
}

