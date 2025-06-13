import { AxiosInstance } from "axios";
import { Resource } from "./resource";

export type SecretResponse = {
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

export class Secret extends Resource {
  kind = "Secret" as const;

  static fromSecretResponse(secretResponse: SecretResponse, oc: AxiosInstance) {
    const secret = new Secret(secretResponse.metadata.name, oc);
    secret.namespace = secretResponse.metadata.namespace;
    secret.uid = secretResponse.metadata.uid;
    secret.resourceVersion = secretResponse.metadata.resourceVersion;
    secret.creationTimestamp = secretResponse.metadata.creationTimestamp;
    secret.apiVersion = secretResponse.metadata.managedFields[0].apiVersion;
    secret.data = secretResponse.data;
    return secret;
  }

  getData(): typeof this.data {
    if (!this.data) return;
    return Object.fromEntries(
      Object.entries(this.data)
        .map(([k, v]) => [k, v])
    );
  }

  edit(new_data: Record<string, string>) {
    // TODO: implement
    console.log({ new_data });
  }
}
