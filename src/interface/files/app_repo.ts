import fs from "node:fs";
import path from "node:path";
import { Repo } from "./repo";

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
}

class InvalidAppRepo extends Error {
  constructor(full_path: string) {
    super(`${full_path} is not a valid app repository, package.json not found`);
  }
}
