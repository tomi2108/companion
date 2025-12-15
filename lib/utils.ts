import yaml from "js-yaml";
import { cwd } from "node:process";

import { Dir } from "@files/dir";

import { Choice } from "./constants";

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

export function kebabToCamel(str: string) {
  return str.replace(/-./g, (x) => x[1]?.toUpperCase() ?? "");
}

export function getCurrentPath() {
  return cwd();
}

export function removeDuplicates<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

export function arrayDifference<T>(
  arr1: T[],
  arr2: T[],
  comparator: (a: T, b: T) => boolean
): T[] {
  return arr1.filter((a) => !arr2.some((b) => comparator(a, b)));
}

export function parseKeyVal(str: string) {
  return Object.fromEntries(str.trim().split("\n").filter(Boolean).map((l) => l.split("=").filter(Boolean)).filter(Boolean));
}

export function toYaml(obj: object) {
  return yaml.dump(obj, {});
}

export function isGitRepo(dir: Dir) {
  return dir.sub(".git").exists();
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function mapObject<
  T extends Record<PropertyKey, any>,
  K extends PropertyKey,
  V
>(
  obj: T,
  fn: (entry: [key: keyof T, value: T[keyof T]]) => readonly [K, V]
): Record<K, V> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) =>
      fn([key as keyof T, value as T[keyof T]])
    )
  ) as Record<K, V>;
}

export const mapToChoice = (e: { toChoice(): Choice }) => e.toChoice();
