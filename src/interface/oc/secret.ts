import { AxiosInstance } from "axios";
import { oc } from "./oc";
import { Choice } from "../../lib/constants";
import yaml from "js-yaml";

type SecretResponse = {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    resourceVersion: string;
    creationTimestamp: string;
    managedFields: {
      apiVersion: string;
    }[];
  };
  data: Record<string, string>;
};

export class Secret {
  name: string;
  namespace?: string;
  uid?: string;
  resourceVersion?: string;
  creationTimestamp?: string;
  data?: Record<string, string>;
  apiVersion?: string;
  kind = "Secret" as const;

  private oc: AxiosInstance;

  static fromSecretResponse(secretResponse: SecretResponse) {
    const secret = new Secret(secretResponse.metadata.name);
    secret.namespace = secretResponse.metadata.namespace;
    secret.uid = secretResponse.metadata.uid;
    secret.resourceVersion = secretResponse.metadata.resourceVersion;
    secret.creationTimestamp = secretResponse.metadata.creationTimestamp;
    secret.apiVersion = secretResponse.metadata.managedFields[0].apiVersion;
    secret.data = secretResponse.data;
    return secret;
  }

  constructor(name: string) {
    this.name = name;
    this.oc = oc();
  }

  toChoice(): Choice {
    return { name: this.name };
  }

  toYaml(): string {
    return yaml.dump({
      apiVersion: this.apiVersion,
      data: this.data,
      kind: this.kind,
      metadata: {
        creationTimestamp: this.creationTimestamp,
        name: this.name,
        namespace: this.namespace,
        resourceVersion: this.resourceVersion,
        uid: this.uid
      }
    });
  }

  edit(new_data: Record<string, string>) {
    // TODO: implement
    console.log({ new_data });
  }
}
