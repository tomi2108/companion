import cp from "node:child_process";

import { EnvFile } from "@files/env_file";
import { FileFormatter } from "@files/formatters";
import { StringFormatter } from "@files/formatters/string_formatter";
import { PackageJson } from "@files/package_json";
import { Dir } from "@interface/dirs/dir";
import { Repo } from "@interface/dirs/repo";
import { CommandRunner } from "@interface/process/runner";
import { ServiceProcess } from "@interface/process/service";
import { loading } from "@lib/decorators/ui";

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

  static isAppRepo(dir: Dir) {
    return dir.hasFile("package.json");
  }

  constructor(dir: Dir) {
    if (!AppRepo.isAppRepo(dir)) throw new InvalidAppRepo(dir);
    super(dir);
    this.package = new PackageJson(dir.getFile("package.json").path);
    this.env = new EnvFile(dir.createFile(".env").path);
  }

  async npm(cmd: string, supressStdout: boolean = false) {
    return new CommandRunner("npm").append(cmd).run({ cwd: this.dir, supressStdout });
  }

  async npmRun(cmd: string, supressStdout: boolean = false) {
    return new CommandRunner("npm").append("run", cmd).run({ cwd: this.dir, supressStdout });
  }

  @loading("Installing dependencies")
  async install(libs: Dependency[] = [], opts?: { dev?: boolean; ignorePeer?: boolean }) {
    const cmd = new CommandRunner("npm").append("install");

    if (opts?.dev) cmd.append("-D");
    if (opts?.ignorePeer) cmd.append("--legacy-peer-deps");
    cmd.append(...libs.map(dependencyToString));

    return cmd.run({ cwd: this.dir, supressStdout: true });
  }

  async build() {
    return await this.npmRun("build");
  }

  async test() {
    return await this.npmRun("test");
  }

  dev(port: number, opts?: { prefix?: string; formatter?: FileFormatter<unknown> }) {
    const tsNodeDev = this.dir.sub("node_modules", "ts-node-dev", "lib").getFile("bin.js").path;
    const app = this.dir.sub("src").getFile("app.ts").path;
    const child = cp.spawn(tsNodeDev, [app], {
      cwd: this.dir.path,
      stdio: "pipe",
      env: {
        ...process.env,
        PORT: String(port)
      }
    });

    return new ServiceProcess(child,
      {
        cwd: this.dir.path,
        formatter: opts?.formatter ?? new StringFormatter(),
        prefix: opts?.prefix
      });
  }

  getPackage() {
    return this.package.read();
  }

}

class InvalidAppRepo extends Error {
  constructor(dir: Dir) {
    super(`${dir.path} is not a valid app repository, package.json not found`);
  }
}
