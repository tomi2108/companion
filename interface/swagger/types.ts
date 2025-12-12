export type SwaggerFile = {
  openapi: string;
  info: SwaggerInfo;
  paths: Record<string, SwaggerPathItem>;
};

type SwaggerInfo = {
  title: string;
  version: string;
  description?: string;
};

export type SwaggerPathItem = {
  get?: SwaggerOperation;
  post?: SwaggerOperation;
  put?: SwaggerOperation;
  delete?: SwaggerOperation;
  patch?: SwaggerOperation;
  options?: SwaggerOperation;
  head?: SwaggerOperation;
  trace?: SwaggerOperation;
  parameters?: SwaggerParameter[];
};

type SwaggerOperation = {
  tags?: string[];
  summary?: string;
  description?: string;
  parameters?: SwaggerParameter[];
  requestBody?: SwaggerRequestBody;
  responses: Record<string, SwaggerResponse>;
};

type SwaggerParameter = {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  required?: boolean;
  description?: string;
  schema?: SwaggerSchema;
};

type SwaggerRequestBody = {
  description?: string;
  required?: boolean;
  content: Record<string, SwaggerMediaType>;
};

type SwaggerResponse = {
  description: string;
  headers?: Record<string, SwaggerHeader>;
  content?: Record<string, SwaggerMediaType>;
};

type SwaggerHeader = {
  description?: string;
  required?: boolean;
  schema?: SwaggerSchema;
};

type SwaggerMediaType = {
  schema?: SwaggerSchema;
  example?: any;
  examples?: Record<string, any>;
};

type SwaggerSchema = {
  type?: string;
  format?: string;
  properties?: Record<string, SwaggerSchema>;
  items?: SwaggerSchema;
  required?: string[];
  enum?: string[];
  nullable?: boolean;
  description?: string;
  default?: any;
  $ref?: string;
};
