import cp, { StdioOptions } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { Repo } from "@files/repo";
import { Config } from "@lib/config";
import log from "@lib/log";
import { tryParseJSONObject } from "@lib/utils";
import { Project } from "@oc/project";

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
  env_file: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;

  static isAppRepo(full_path: string) {
    const package_path = path.join(full_path, "package.json");
    return fs.existsSync(package_path);
  }

  private updateState(full_path = this.full_path) {
    const package_path = path.join(full_path, "package.json");
    let package_file: any = {};
    try {
      package_file = JSON.parse(fs.readFileSync(package_path).toString());
    } catch (err) {
      log.error(`Error reading package.json in ${full_path}`);
      throw err;
    }
    this.version = package_file.version;
    this.description = package_file.description;
    this.package = package_file.name;
    this.dependencies = package_file.dependencies;
    this.devDependencies = package_file.devDependencies;
  }

  constructor(full_path: string) {
    if (!AppRepo.isAppRepo(full_path)) throw new InvalidAppRepo(full_path);
    super(full_path);
    this.env_file = path.join(this.full_path, ".env");
    this.updateState(full_path);
  }

  getEnv(): Record<string, string> {
    if (!fs.existsSync(this.env_file)) return {};
    const content = fs.readFileSync(this.env_file).toString().trim();
    return Object.fromEntries(content.split("\n").map((l) => l.trim().split("=")));
  }

  addEnv(key: string, value: string | number) {
    fs.appendFileSync(this.env_file, `${key}=${value}\n`);
  }

  removeEnv(key: string) {
    this.setEnv({ ...this.getEnv(), [key]: undefined });
  }

  setEnv(newEnv: Record<string, string | number | undefined>) {
    if (fs.existsSync(this.env_file)) fs.rmSync(this.env_file);
    Object.entries(newEnv).forEach(([key, value]) =>
      value ? fs.appendFileSync(this.env_file, `${key}=${value}\n`) : null
    );
  }

  externalEnvs() {
    if (!fs.existsSync(this.env_file)) return;
    const file_content = fs.readFileSync(this.env_file).toString();
    const config = Config.get().openshift;
    const replaced = file_content
      .replace(new RegExp(`.${config.namespace_prefix}`, "g"), `-${Config.get().openshift.namespace_prefix}`)
      .replace(/\.svc\.cluster\.local:8080/g, `.apps.${config.server_name}.cuyorh.tcloud.ar`);
    fs.writeFileSync(this.env_file, replaced);
  }

  internalEnvs() {
    if (!fs.existsSync(this.env_file)) return;
    const file_content = fs.readFileSync(this.env_file).toString();
    const replaced = file_content
      .replaceAll(new RegExp(`-${Config.get().openshift.namespace_prefix}`, "g"), `.${Config.get().openshift.namespace_prefix}`)
      .replaceAll(/\.apps\..*\.cuyorh\.tcloud\.ar/g, ".svc.cluster.local:8080");
    fs.writeFileSync(this.env_file, replaced);
  }

  async copyEnv(project: Project) {
    const { name } = await this.getInfo();
    const deployment = await project.getDeployment(name);
    const configMaps = await deployment.getConfigMaps() ?? [];
    const secrets = deployment.getSecrets() ?? [];

    if (fs.existsSync(this.env_file)) fs.rmSync(this.env_file);
    for (const r of [...secrets, ...configMaps]) {
      for (const [key, value] of Object.entries(await r.getData() ?? {})) {
        this.addEnv(key, value);
      }
    }

    const extraEnvs = {
      STDOUT_LOGS: "on"
    };

    Object.entries(extraEnvs).forEach(([key, value]) => {
      this.removeEnv(key);
      this.addEnv(key, value);
    });
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

  async install(libs?: Dependency[], opts?: { dev?: boolean }) {
    const dependencies = libs ?? [];
    return new Promise((resolve, reject) => {
      const child = cp.spawn("npm",
        [
          "install",
          opts?.dev ? "-D" : "",
          ...dependencies.map(dependencyToString)
        ],
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

  override reset() {
    const res = super.reset();
    this.updateState(this.full_path);
    return res;
  }

  override checkout(branch: string) {
    const res = super.checkout(branch);
    this.updateState(this.full_path);
    return res;
  }

  override createNewBranch(name: string) {
    const res = super.createNewBranch(name);
    this.updateState(this.full_path);
    return res;
  }

  override switchBranchIfExists(branch: string) {
    const res = super.switchBranchIfExists(branch);
    this.updateState(this.full_path);
    return res;
  }
}

class InvalidAppRepo extends Error {
  constructor(full_path: string) {
    super(`${full_path} is not a valid app repository, package.json not found`);
  }
}
