import { AxiosInstance } from "axios";
import { Resource } from "./resource";
import { base64Decode, base64Encode } from "../jira/jira";
import { removeDuplicates } from "../../lib/utils";

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

const enconde_object = (o: object) => Object.fromEntries(
  Object.entries(o)
    .map(([k, v]) => [k, base64Encode(v)])
);

const decode_object = (o: object) => Object.fromEntries(
  Object.entries(o)
    .map(([k, v]) => [k, base64Decode(v)])
);

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
    return decode_object(this.data);
  }

  setData(data: typeof this.data) {
    if (!data) return;
    this.data = enconde_object(data);
  }

  async save() {
    const body = {
      kind: this.kind,
      apiVersion: this.apiVersion,
      data: this.getData(),
      metadata: {
        name: this.name,
        creationTimestamp: null
      }
    };
    const params = { fieldManager: "kubectl-create", fieldValidation: "Ignore" };

    if (!body.data) throw new Error(`Missing data in secret ${this.name}`);
    if (!this.namespace) throw new Error(`Missing namespace in secret ${this.name}`);

    const keys = Object.keys(body.data);
    if (keys.length !== removeDuplicates(keys).length) throw new Error("Secrets cannot have duplicate keys");

    await this.oc.post(`/api/v1/namespaces/${this.namespace}/secrets`, body, { params });
  }

  edit(new_data: Record<string, string>) {
    const encoded = enconde_object(new_data);
    console.log({ encoded });
  }
}
