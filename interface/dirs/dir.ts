import fs from "node:fs";
import path from "node:path";

import { FileNotFound } from "../files/errors";
import { File } from "../files/file";
import { TextFile } from "../files/text_file";

export class Dir {
  readonly path: string;

  constructor(path: string) {
    this.path = path;
  }

  name() {
    return path.basename(this.path);
  }

  prev() {
    return new Dir(path.resolve(this.path, ".."));
  }

  sub(...dir_name: string[]) {
    return new Dir(path.join(this.path, ...dir_name));
  }

  readFiles() {
    if (!this.exists()) return [];

    return fs.readdirSync(this.path, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => new TextFile(path.join(this.path, d.name)));
  }

  readDirs() {
    const ignore = new Set([".git", "node_modules"]);
    if (!this.exists()) return [];

    return fs.readdirSync(this.path, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .filter((d) => !ignore.has(d.name))
      .map((d) => new Dir(path.join(this.path, d.name)));
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
    return new Dir(path.join(this.path, path.basename(dir.path)));
  }

  exists() {
    return fs.existsSync(this.path);
  }

  delete() {
    if (this.exists()) fs.rmSync(this.path, { recursive: true });
  }

  contains(target: File | Dir) {
    const base = path.resolve(this.path);
    const candidate = path.resolve(target.path);

    const rel = path.relative(base, candidate);
    return Boolean(rel && !rel.startsWith("..") && !path.isAbsolute(rel));
  }

  relativePathTo(target: File | Dir): string {
    const base = path.resolve(this.path);
    const candidate = path.resolve(target.path);
    const rel = path.relative(base, candidate);
    return rel;
  }

  getRelative(relativePath: string): Dir | TextFile {
    const fullPath = path.resolve(this.path, relativePath);
    if (!fs.existsSync(fullPath)) throw new FileNotFound(fullPath);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) return new Dir(fullPath);
    if (stat.isFile()) return new TextFile(fullPath);

    throw new FileNotFound(fullPath);
  }

  traverse() {
    const gitignore = this.createFile(".gitignore");
    const gitignored = gitignore.exists() ? gitignore.read().split("\n") : [];
    const ignore = new Set([
      ...gitignored,
      ".git",
      "dist",
      "coverage",
      ".husky",
      ".next",
      "node_modules",
      "out",
      "build",
      ".yarn"
    ]);
    const result: Array<TextFile> = [];
    if (!this.exists()) return result;
    const walk = (dir: Dir) => {
      const entries = fs.readdirSync(dir.path, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir.path, entry.name);

        if (entry.isDirectory()) {
          if (ignore.has(entry.name)) continue;
          walk(new Dir(fullPath));
        }

        if (entry.isFile()) {
          if (ignore.has(entry.name)) continue;
          result.push(new TextFile(fullPath));
        }
      }
    };

    walk(this);
    return result;
  }

  copy(to: Dir) {
    fs.cpSync(this.path, to.path, { recursive: true });
    return to;
  }

  toChoice() {
    return { name: this.path };
  }

  toString() {
    return this.path;
  }
}

