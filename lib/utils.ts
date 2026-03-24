import { Dir } from "@interface/dirs/dir";

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

export function kebabToCamel(str: string) {
  return str.replace(/-./g, (x) => x[1]?.toUpperCase() ?? "");
}

export function removeDuplicatesByKey<T>(arr: T[], getKey: (item: T) => string) {
  return Array.from(new Map(arr.map((item) => [getKey(item), item])).values());
}

export function arrayDifference<T>(
  arr1: T[],
  arr2: T[],
  comparator: (a: T, b: T) => boolean
): T[] {
  return arr1.filter((a) => !arr2.some((b) => comparator(a, b)));
}

export function isGitRepo(dir: Dir) {
  return dir.sub(".git").exists();
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mapToChoice = (e: { toChoice(): Choice }) => e.toChoice();

// TODO(20260318-002421): not the best, find another way to filter out micro_front_end deployments
export const filterFrontendDeployments = (e: { name: string }) => e.name.startsWith("app-");
