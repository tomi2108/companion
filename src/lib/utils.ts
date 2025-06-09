import fs from "node:fs";
import crypto from "node:crypto";

// do not bother with typing this will probably be removed...
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

export function readdirs(p: string) {
  return fs.readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
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

