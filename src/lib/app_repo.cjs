const { Repo } = require("./repo.cjs");
const fs = require("node:fs");
const path = require("node:path");

class InvalidAppRepo extends Error {
  constructor(full_path) {
    super(`${full_path} is not a valid app repository, package.json not found`);
  }
}

class AppRepo extends Repo {
  constructor(full_path) {
    const package_path = path.join(full_path, "package.json");
    if (!fs.existsSync(package_path)) throw new InvalidAppRepo();

    const package_file = JSON.parse(fs.readFileSync(package_path));
    super(full_path);
    this.version = package_file.version;
    this.package = package_file.name;
  }
}

module.exports = { AppRepo };
