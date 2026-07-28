import { deepMerge } from "@lib/utils";

import { ConfigRegistry } from "./registry";

export class ConfigView {
  private data: Record<string, unknown>;

  constructor(
    raw: Record<string, unknown>,
    preset?: Record<string, unknown>,
    { validate }: { validate: boolean } = { validate: true }
  ) {
    this.data = this.validate(raw, preset, validate);
  }

  protected validate(
    raw: Record<string, unknown>,
    preset?: Record<string, unknown>,
    validate?: boolean
  ) {
    const result: Record<string, unknown> = {};

    for (const section of ConfigRegistry.getSections()) {
      const key = section.key;

      const userSlice = raw?.[key] ?? {};
      const presetSlice = preset?.[key] ?? {};

      const runtime = ConfigRegistry.getRuntime();

      const defaults = section.defaults?.() ?? {};
      const merged = deepMerge(deepMerge(defaults, presetSlice), userSlice);
      const getKey = (key: string) => merged[key];
      const runtimeSlice = runtime ? section.applyRuntime?.(runtime, getKey) : {};

      if (validate) section.validate(deepMerge(merged, runtimeSlice));
      result[section.key] = merged;
    }

    return result;
  }

  get(path: string) {
    return path.split(".").reduce<any>((acc, k) => acc?.[k], this.data);
  }
}

