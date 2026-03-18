import { Dir } from "@interface/dirs/dir";

export class ProjectLayout {
  constructor(private root: Dir) { }

  get server() {
    return this.src.sub("server").createFile("index.ts");
  }

  get src() {
    return this.root.sub("src");
  }

  srcFile(name: string) {
    return this.src.createFile(name);
  }

  get tests() {
    return this.root.sub("tests");
  }

  testFile(name: string) {
    return this.tests.createFile(name);
  }

  get configuration() {
    return this.src.sub("configuration");
  }

  get services() {
    return this.src.sub("services");
  }

  serviceFile(name: string) {
    return this.services.createFile(name);
  }

  get models() {
    return this.src.sub("models");
  }

  get testsConfiguration() {
    return this.tests.sub("configuration");
  }

  get testsServices() {
    return this.tests.sub("services");
  }

  testServiceFile(name: string) {
    return this.testsServices.createFile(name);
  }

  configFile(name: string) {
    return this.configuration.createFile(name);
  }

  testConfigFile(name: string) {
    return this.testsConfiguration.createFile(name);
  }
}

