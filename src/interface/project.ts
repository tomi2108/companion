import { Choice } from "../lib/constants";
import { oc } from "./oc";
import { Pod } from "./pod";

export class Project {
  name: string;
  private oc: any;

  static fromProjectResponse(projectResponse: any) {
    const p = new Project(projectResponse.metadata.name);
    return p;
  }

  constructor(name: string) {
    this.name = name;
    this.oc = oc();
  }

  async getPods() {
    return (await this.oc.get(`/api/v1/namespaces/${this.name}/pods`))
      .data.items.map(Pod.fromPodResponse) as Pod[];
  }

  toChoice(): Choice {
    return { name: this.name };
  }
}
