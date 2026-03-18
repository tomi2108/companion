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

export function removeDuplicates<T>(arr: T[]) {
  return Array.from(new Set(arr));
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

export function centerPad(str: string, targetLength: number, padChar = " ") {
  if (str.length >= targetLength) return str;

  const totalPadding = targetLength - str.length;
  const padLeftLength = Math.floor(totalPadding / 2);

  const paddedStr = str
    .padStart(str.length + padLeftLength, padChar)
    .padEnd(str.length + totalPadding, padChar);

  return paddedStr;
}

export function zip<A, B>(a: A[], b: B[]): Array<[A, B]> {
  const len = Math.min(a.length, b.length);
  const result: Array<[A, B]> = [];

  for (let i = 0; i < len; i++) {
    result.push([a[i] as A, b[i] as B]);
  }

  return result;
}
