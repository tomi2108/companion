import { RuntimeConfig } from "@lib/runtime";

import { ConfigSection } from "./interface";

export class ConfigRegistry {
  private static sections = new Map<string, ConfigSection>();
  private static runtime: RuntimeConfig | null = null;

  static register(section: ConfigSection) {
    const key = section.key;
    if (this.sections.has(key)) throw new Error(`Config ${key} is already registered`);
    this.sections.set(key, section);
  }

  static getSections() {
    return Array.from(this.sections.values());
  }

  static getRuntime() {
    return this.runtime;
  }

  static applyRuntime(runtime: RuntimeConfig) {
    this.runtime = runtime;
  }
}

