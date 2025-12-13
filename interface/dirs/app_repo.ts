import cp, { StdioOptions } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { EnvFile } from "@files/env_file";
import { Repo } from "@interface/dirs/repo";
import log from "@lib/log";
import { tryParseJSONObject } from "@lib/utils";
import { Project } from "@oc/project";

import { RepoAction } from "./actions";
import { GenerateJiraTicketsAction } from "./actions/generate_jira_tickets";

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
  env_file: EnvFile;
  package_file: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  override actions: RepoAction[] = [new GenerateJiraTicketsAction()];

  static isAppRepo(full_path: string) {
    const package_path = path.join(full_path, "package.json");
    return fs.existsSync(package_path);
  }

  public save() {
    const package_path = this.package_file;
    let package_file: any = {};
    try {
      package_file = JSON.parse(fs.readFileSync(package_path).toString());
    } catch (err) {
      log.error(`Error reading package.json in ${this.full_path}`);
      throw err;
    }
    package_file.version = this.version;
    package_file.description = this.description;
    package_file.name = this.package;
    package_file.dependencies = this.dependencies;
    package_file.devDependencies = this.devDependencies;
    package_file.peerDependencies = this.peerDependencies;
    fs.writeFileSync(package_path, JSON.stringify(package_file, null, 2));
  }

  override updateState() {
    const package_path = path.join(this.full_path, "package.json");
    let package_file: any = {};
    try {
      package_file = JSON.parse(fs.readFileSync(package_path).toString());
    } catch (err) {
      console.log(err);
      log.error(`Error reading package.json in ${this.full_path}`);
      throw err;
    }
    this.version = package_file.version;
    this.description = package_file.description;
    this.package = package_file.name;
    this.dependencies = package_file.dependencies;
    this.devDependencies = package_file.devDependencies;
    this.peerDependencies = package_file.peerDependencies;
  }

  constructor(full_path: string) {
    if (!AppRepo.isAppRepo(full_path)) throw new InvalidAppRepo(full_path);
    super(full_path);
    this.package_file = path.join(full_path, "package.json");
    this.env_file = new EnvFile(path.join(this.full_path, ".env"));
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
        ...process.env,
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
