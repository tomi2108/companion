export type PostmanFile = {
  info: PostmanInfo;
  item: PostmanItem[];
  event?: PostmanEvent[];
  variable?: PostmanVariable[];
};

type PostmanInfo = {
  name: string;
  description?: string;
  schema: string;
};

type PostmanItem = PostmanFolder | PostmanRequestItem;

export type PostmanFolder = {
  name: string;
  description?: string | PostmanDescription;
  item: PostmanItem[];
  event?: PostmanEvent[];
  variable?: PostmanVariable[];
};

export type PostmanRequestItem = {
  name: string;
  request: PostmanRequest;
  event?: PostmanEvent[];
};

type PostmanRequest = {
  method: string;
  header?: PostmanHeader[];
  url?: PostmanUrl;
  body?: PostmanRequestBody;
  description?: string | PostmanDescription;
};

type PostmanHeader = {
  key: string;
  value: string;
  type?: string;
  disabled?: boolean;
};

type PostmanUrl = {
  raw?: string;
  protocol?: string;
  host?: string[];
  path?: string[];
  port?: string;
  query?: PostmanQueryParam[];
  variable?: PostmanVariable[];
};

type PostmanQueryParam = {
  key: string;
  value?: string;
  description?: string | PostmanDescription;
  disabled?: boolean;
};

type PostmanVariable = {
  key: string;
  value?: any;
  description?: string | PostmanDescription;
  type?: string;
  disabled?: boolean;
};

type PostmanRequestBody = {
  mode: "raw" | "urlencoded" | "formdata" | "file" | "graphql";
  raw?: string;
  graphql?: {
    query: string;
    variables?: any;
  };
  urlencoded?: PostmanKeyValue[];
  formdata?: (PostmanKeyValue | PostmanFormDataFile)[];
  file?: { src?: string };
  options?: any;
};

type PostmanKeyValue = {
  key: string;
  value?: string;
  type?: string;
  disabled?: boolean;
  description?: string | PostmanDescription;
};

type PostmanFormDataFile = {
  key: string;
  src: string | string[];
  type: "file";
  disabled?: boolean;
  description?: string | PostmanDescription;
};

type PostmanEvent = {
  listen: "test" | "prerequest";
  script: PostmanScript;
};

type PostmanScript = {
  id?: string;
  type?: string;
  exec: string[];
};

type PostmanDescription = {
  content: string;
  type?: string;
  version?: string;
};

