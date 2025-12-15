import cp, { StdioOptions } from "node:child_process";

import { Dir } from "@files/dir";
import { EnvFile } from "@files/env_file";
import { JsonFormatter } from "@files/formatters/json_formatter";
import { PackageJson } from "@files/package_json";
import { Repo } from "@interface/dirs/repo";
import { JiraTaskTracker } from "@interface/tasks/trackers/jira_task_tracker";
import { Project } from "@oc/project";

import { RepoAction } from "./actions";
import { CreateMissingTasksAction } from "./actions/track_tasks";

export type Dependency = {
  name: string;
  version?: string;
};

function dependencyToString(d: Dependency) {
  if (!d.version) return d.name;
  return `${d.name}@${d.version}`;
}

export class AppRepo extends Repo {
  env: EnvFile;
  package: PackageJson;
  override actions: RepoAction[] = [new CreateMissingTasksAction(new JiraTaskTracker())];

  static isAppRepo(dir: Dir) {
    return dir.hasFile("package.json");
  }

  constructor(dir: Dir) {
    if (!AppRepo.isAppRepo(dir)) throw new InvalidAppRepo(dir);
    super(dir);
    this.package = new PackageJson(dir.getFile("package.json").path);
    this.env = new EnvFile(dir.createFile(".env").path);
  }

  private async npmRun(cmd: string, stdio?: StdioOptions) {
    return new Promise((resolve, reject) => {
      const child = cp.spawn("npm",
        ["run", cmd],
        {
          stdio,
          cwd: this.dir.path
        });
      child.on("error", reject);
      child.on("exit", (code) => {
        if (code === 0) resolve(undefined);
        else reject(new Error(`Error running npm run ${cmd} in ${this.dir.path}`));
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
          cwd: this.dir.path
        });

      child.on("error", reject);
      child.on("exit", (code) => {
        if (code === 0) resolve(undefined);
        else reject(new Error(`Error installing ${this.dir.path}`));
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
    const ts_node_dev_path = this.dir.sub("node_modules", "ts-node-dev", "lib").getFile("bin.js").path;
    const app_path = this.dir.sub("src").getFile("app.ts").path;

    const child = cp.spawn(ts_node_dev_path, [app_path], {
      stdio: "pipe",
      cwd: this.dir.path,
      env: {
        ...process.env,
        PORT: String(port)
      }
    });

    return {
      process: child, promise: new Promise((resolve, reject) => {
        const formatter = new JsonFormatter();
        const pre = opts?.prefix ? `[${opts.prefix}]: ` : "";
        child.stdout.on("data", (data) => {
          let message = data.toString().trim();
          if (!opts?.raw) {
            const formatted = formatter.tryFromString(message);
            if (formatted) message = formatter.toString(formatted);
          }
          if (message) console.log(pre, message);
        });

        child.stderr.on("data", (message) => {
          console.error(pre, message.toString().trim());
        });

        child.on("error", reject);
        child.on("exit", (code) => {
          if (code === 0) resolve(undefined);
          else reject(new Error(`Error starting ${this.dir.path}`));
        });
      })
    };
  }

  getPackage() {
    return this.package.read();
  }

  async findPipeline(project: Project, q: string) {
    const { name } = await this.getInfo();
    const pipelines = await project.getPipelineRuns();
    const pipeline = pipelines.find((p) => p.name.includes(q) && p.name.includes(name)) ?? null;
    return pipeline;
  }
}

class InvalidAppRepo extends Error {
  constructor(dir: Dir) {
    super(`${dir.path} is not a valid app repository, package.json not found`);
  }
}
