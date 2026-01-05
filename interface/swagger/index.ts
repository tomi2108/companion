import { AppRepo } from "@interface/dirs/app_repo";
import { HttpFile } from "@interface/http/http_file";
import { Req, varRegex } from "@interface/http/req";

import { SwaggerFile, SwaggerPathItem } from "./types";

export class Swagger {
  file: HttpFile;
  app_repo: AppRepo;

  constructor(file: HttpFile, app_repo: AppRepo) {
    this.file = file;
    this.app_repo = app_repo;
  }

  async generate(): Promise<SwaggerFile> {
    const { description, version } = this.app_repo.getPackage();
    return {
      openapi: "3.0.2",
      info: {
        title: this.file.service,
        description,
        version
      },
      paths: this.fromFile(this.file)
    };
  }

  private fromFile(file: HttpFile): Record<string, SwaggerPathItem> {
    const paths: Record<string, any> = {};
    for (const fragment of file.getRequests().map((r) => this.fromRequest(r))) {
      for (const [path, methods] of Object.entries(fragment)) {
        if (!paths[path]) paths[path] = {};
        Object.assign(paths[path], methods);
      }
    }
    return paths;
  }

  private fromRequest(req: Req): SwaggerPathItem {
    const path = req.pathname.replace(varRegex, "{$1}");
    const pathParams = [...req.pathname.matchAll(varRegex)].map((m) => m[1]);
    const queryParams = Object.entries(req.params ?? {})
      .flatMap(([k, v]) => {
        if (!v) return [];
        const matches = [...v.matchAll(varRegex)].map((m) => m[1]);
        return matches.length ? matches.map((name) => ({ key: k, name })) : [];
      });

    const parameters = [
      ...pathParams.map((name) => ({
        name,
        in: "path",
        required: true,
        schema: { type: "string" }
      })),
      ...queryParams.map(({ key }) => ({
        name: key,
        in: "query",
        required: false,
        schema: { type: "string" }
      }))
    ];

    const requestBody = req.body && req.body.trim() !== "{}"
      ? {
        requestBody: {
          content: {
            "application/json": {
              // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/rishi/-/issues/41]: infer body type
              schema: {
                type: "object"
              }
            }
          }
        }
      }
      : {};

    return {
      [path]: {
        [req.method.toLowerCase()]: {
          parameters,
          ...requestBody,
          responses: {
            200: { description: "OK" },
            400: { description: "BAD_REQUEST" },
            500: { description: "INTERNAL_SERVER_ERROR" }
          }
        }
      }
    };
  }
}
