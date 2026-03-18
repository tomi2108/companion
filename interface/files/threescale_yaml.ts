
import { ThreescaleYamlContent, ThreescaleYamlFormatter } from "./formatters/threescale_yaml_formatter";
import { YamlFile } from "./yaml_file";

export class ThreescaleYaml extends YamlFile<ThreescaleYamlContent> {

  init() {
    const initial = {
      kind: "abm-backend",
      metadata: { name: "create" },
      type: "create",
      specs: {
        backend: {
          "deployment-name": "",
          "http-methods": "",
          pattern: "/",
          environment: "",
          path: "/",
          description: "",
          namespace: ""
        },
        product: {
          "system-name": ""
        }
      }
    };
    this.write(initial);
  }

  constructor(path: string) {
    super(path, new ThreescaleYamlFormatter());
  }

  setSystemName(systemName: string) {
    this.writePartial({ specs: { product: { "system-name": systemName } } });
  }

  setMethods(methods: string[]) {
    this.writePartial({ specs: { backend: { "http-methods": methods.join(",") } } });
  }

  setNamespace(namespace: string) {
    this.writePartial({ specs: { backend: { environment: namespace } } });
    this.writePartial({ specs: { backend: { namespace } } });
  }

  setDescription(description: string) {
    this.writePartial({ specs: { backend: { description } } });
  }

  setDeployment(deployment: string) {
    this.writePartial({ specs: { backend: { path: `/${deployment}` } } });
    this.writePartial({ specs: { backend: { "deployment-name": deployment } } });
  }

  setName(name: string) {
    this.writePartial({ metadata: { name: `create-${name}` } });
  }

}
