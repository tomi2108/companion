
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

export class InvalidCronYaml extends Error {
  constructor(path: string) {
    super(`${path} is not a valid cron yaml`);
  }
}

export class InvalidThreescaleYaml extends Error {
  constructor(path: string) {
    super(`${path} is not a valid threescale yaml`);
  }
}
