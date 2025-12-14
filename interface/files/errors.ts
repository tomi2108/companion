
export class FileNotFound extends Error {
  constructor(path: string) {
    super(`File ${path} was not found`);
  }
}

export class InvalidJsonFile extends Error {
  constructor(path: string) {
    super(`Invalid json ${path}`);
  }
}

export class InvalidYamlFile extends Error {
  constructor(path: string) {
    super(`Invalid yaml file ${path}`);
  }
}

export class InvalidDeployYaml extends Error {
  constructor(path: string) {
    super(`${path} is not a valid deploy yaml`);
  }
}

export class InvalidMonitorYaml extends Error {
  constructor(path: string) {
    super(`${path} is not a valid monitor yaml`);
  }
}
