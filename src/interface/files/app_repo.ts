import fs from "node:fs";
import path from "node:path";
import cp, { StdioOptions } from "node:child_process";
import { Repo } from "./repo";
import { Project } from "../oc/project";
import { tryParseJSONObject } from "../../lib/utils";

export type Dependency = {
  name: string;
  version?: string;
};

function dependencyToString(d: Dependency) {
  if (!d.version) return d.name;
  return `${d.name}@${d.version}`;
}

export class AppRepo extends Repo {
  version?: string;
  package?: string;
  description?: string;

  constructor(full_path: string) {
    const package_path = path.join(full_path, "package.json");
    if (!fs.existsSync(package_path)) throw new InvalidAppRepo(full_path);

    const package_file = JSON.parse(fs.readFileSync(package_path).toString());
    super(full_path);

    this.version = package_file.version;
    this.description = package_file.description;
    this.package = package_file.name;
  }

  getEnv(): Record<string, string> {
    const env_file = path.join(this.full_path, ".env");
    if (!fs.existsSync(env_file)) return {};
    const content = fs.readFileSync(env_file).toString().trim();
    return Object.fromEntries(content.split("\n").map((l) => l.trim().split("=")));
  }

  addEnv(key: string, value: string | number) {
    const env_file = path.join(this.full_path, ".env");
    fs.appendFileSync(env_file, `${key}=${value}\n`);
  }

  removeEnv(key: string) {
    this.setEnv({ ...this.getEnv(), [key]: undefined });
  }

  setEnv(newEnv: Record<string, string | number | undefined>) {
    const env_file = path.join(this.full_path, ".env");
    if (fs.existsSync(env_file)) fs.rmSync(env_file);
    Object.entries(newEnv).forEach(([key, value]) =>
      value ? fs.appendFileSync(env_file, `${key}=${value}\n`) : null
    );
  }

  async copyEnv(project: Project) {
    const { name } = await this.getInfo();
    const deployment = await project.getDeployment(name);
    const configMaps = await deployment.getConfigMaps() ?? [];
    const secrets = deployment.getSecrets() ?? [];

    const env_file = path.join(this.full_path, ".env");
    if (fs.existsSync(env_file)) fs.rmSync(env_file);
    for (const r of [...secrets, ...configMaps]) {
      for (const [key, value] of Object.entries(await r.getData() ?? {})) {
        this.addEnv(key, value);
      }
    }
  }

  private async npmRun(cmd: string, stdio?: StdioOptions) {
    return new Promise((resolve, reject) => {
      const child = cp.spawn("npm",
        ["run", cmd],
        {
          stdio,
          cwd: this.full_path
        });
      child.on("error", reject);
      child.on("exit", (code) => {
        if (code === 0) resolve(undefined);
        else reject(new Error(`Error running npm run ${cmd} in ${this.full_path}`));
      });
    });
  }

  async install(libs?: Dependency[]) {
    const dependencies = libs ?? [];
    return new Promise((resolve, reject) => {
      const child = cp.spawn("npm",
        ["install", ...dependencies.map(dependencyToString)],
        {
          stdio: "pipe",
          cwd: this.full_path
        });

      child.on("error", reject);
      child.on("exit", (code) => {
        if (code === 0) resolve(undefined);
        else reject(new Error(`Error installing ${this.full_path}`));
      });
    });
  }

  async build() {
    return await this.npmRun("build", "inherit");
  }

  async test() {
    return await this.npmRun("test", "inherit");
  }

  dev(port: number, opts?: { prefix?: string; raw?: boolean }) {
    const ts_node_dev_path = path.join(this.full_path, "node_modules", "ts-node-dev", "lib", "bin.js");
    const app_path = path.join(this.full_path, "src", "app.ts");

    const child = cp.spawn(ts_node_dev_path, [app_path], {
      stdio: "pipe",
      cwd: this.full_path,
      env: {
        PORT: String(port)
      }
    });

    return {
      process: child, promise: new Promise((resolve, reject) => {
        const pre = opts?.prefix ? `[${opts.prefix}]: ` : "";
        child.stdout.on("data", (data) => {
          let message = data.toString().trim();
          if (!opts?.raw) message = tryParseJSONObject(message);
          if (message) console.log(pre, message);
        });

        child.stderr.on("data", (message) => {
          console.error(pre, message.toString().trim());
        });

        child.on("error", reject);
        child.on("exit", (code) => {
          if (code === 0) resolve(undefined);
          else reject(new Error(`Error starting ${this.full_path}`));
        });
      })
    };
  }

  async findPipeline(project: Project, q: string) {
    const { name } = await this.getInfo();
    const pipelines = await project.getPipelineRuns();
    const pipeline = pipelines.find((p) => p.name.includes(q) && p.name.includes(name)) ?? null;
    return pipeline;
  }
}

class InvalidAppRepo extends Error {
  constructor(full_path: string) {
    super(`${full_path} is not a valid app repository, package.json not found`);
  }
}
