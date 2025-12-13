
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
