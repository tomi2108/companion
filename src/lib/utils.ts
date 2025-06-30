import fs from "node:fs";
import crypto from "node:crypto";
import { Config } from "./config";
import openEditor from "open-editor";
import open from "open";
import { cwd } from "node:process";
import yaml from "js-yaml";

// do not bother with typing this, adds no value
export function deepMerge(obj1: any, obj2: any) {
  for (const key in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, key) && obj2[key] !== undefined && obj2[key] !== null) {
      if (obj2[key] instanceof Object && obj1[key] instanceof Object) {
        obj1[key] = deepMerge(obj1[key], obj2[key]);
      } else {
        obj1[key] = obj2[key];
      }
    }
  }
  return obj1;
}

export function removePrefix(str: string, prefix: string) {
  if (str.startsWith(prefix)) return str.slice(prefix.length);
  return str;
}

export function removeSuffix(str: string, suffix: string) {
  if (str.endsWith(suffix)) return str.slice(0, -suffix.length);
  return str;
}

export function readdirs(p: string | undefined) {
  if (!p || !fs.existsSync(p)) return;
  return fs.readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory());
}

export function readfiles(p: string) {
  return fs.readdirSync(p, { withFileTypes: true }).filter((d) => d.isFile()).map((d) => d.name);
}

export function md5FromFile(file_path: string) {
  const content = fs.readFileSync(file_path);
  const hash = crypto.createHash("md5");
  hash.update(content);
  return hash.digest("hex");
}

export function kebabToCamel(str: string) {
  return str.replace(/-./g, (x) => x[1].toUpperCase());
}

export async function openInBrowser(url: string) {
  const browser = Config.get().preferences.browser;
  if (browser) open(url, { app: { name: browser } });
  else open(url);
}

export async function openInEditor(full_path: string, opts?: { wait?: boolean }) {
  await openEditor([{ file: full_path }], { wait: opts?.wait, editor: Config.get().preferences.editor });
}

export function getCurrentPath() {
  return cwd();
}

export function tryParseJSONObject(jsonString: unknown) {
  try {
    const o = JSON.parse(jsonString as string);
    if (o && typeof o === "object") {
      return o;
    }
  } catch (e) {
    return false;
  }
}

export function removeDuplicates<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

export function parseKeyVal(str: string) {
  return Object.fromEntries(str.trim().split("\n").filter(Boolean).map((l) => l.split("=").filter(Boolean)).filter(Boolean));
}

export function toYaml(obj: object) {
  return yaml.dump(obj, {});
}
