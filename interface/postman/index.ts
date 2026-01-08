import { HttpFile } from "@interface/http/http_file";
import { Req, varRegex } from "@interface/http/req";

import { PostmanFile, PostmanFolder, PostmanRequestItem } from "./types";

const schema = "https://schema.getpostman.com/json/collection/v2.1.0/collection.json";
export class Postman {
  files: HttpFile[];

  constructor(files: HttpFile[] = []) {
    this.files = files;
  }

  generate(name: string): PostmanFile {
    return {
      info: { name, schema },
      item: this.files.map((f) => this.fromFile(f))
    };
  }

  mergeFiles(name: string, files: PostmanFile[]): PostmanFile {
    if (files.length === 0) throw new Error("Cannot merge empty array");
    // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/dux/-/issues/68]: Think about events and variables
    return {
      item: files.map((f) => ({
        item: f.item,
        name: f.info.name
      })),
      info: { name, schema }
    };

  }

  private fromFile(file: HttpFile): PostmanFolder {
    const items = file.getRequests().map((r) => this.fromRequest(r));

    return {
      name: file.service,
      item: items
    };
  }

  private fromRequest(req: Req): PostmanRequestItem {
    const path = req.pathname.replace(varRegex, ":$1");
    const url = {
      raw: path,
      protocol: "http",
      host: [path.split("/")[1] || ""],
      path: path.split("/").slice(2),
      query: Object.entries(req.params ?? {})
        .filter(([, v]) => v)
        .map(([key, val]) => ({
          key,
          value: val!.toString()
        }))
    };

    const headers = Object.entries(req.headers ?? {})
      .filter(([, v]) => v)
      .map(([key, value]) => ({ key, value })) as { key: string; value: string }[]; // we are filtering nulls

    const body = req.body && req.body.trim() !== "{}"
      ? {
        mode: "raw",
        raw: req.body,
        options: { raw: { language: "json" } }
      } as const
      : undefined;

    return {
      name: `${req.method.toUpperCase()} ${path}`,
      request: {
        method: req.method.toUpperCase(),
        header: headers,
        url,
        ...body ? { body } : {}
      }
    };
  }

}
