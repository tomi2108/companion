
export class FileNotFound extends Error {
  constructor(path: string) {
    super(`File ${path} was not found`);
  }
}

export class InvalidJsonFile extends Error {
  constructor(path: string) {
    super(`Invalid json file ${path}`);
  }
}

export class InvalidYamlFile extends Error {
  constructor(path: string) {
    super(`Invalid yaml file ${path}`);
  }
}

export class InvalidDeployYaml extends Error {
  constructor(full_path: string) {
    super(`${full_path} is not a valid deploy yaml`);
  }
}
