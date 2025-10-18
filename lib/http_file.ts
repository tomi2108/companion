import fs from "node:fs";

import { Config } from "./config";
import { Req } from "./req";

const valid_methods = [
  "GET",
  "PUT",
  "POST",
  "PATCH",
  "DELETE"
];

const line_filter = (l: string) => l !== "" && l !== "###" && !l.includes("localhost") && l !== "\n";

export class HttpFile {
  file_path: string;
  variables: Record<string, string>;
  requests: Req[];
  service: string;
  url: string | null;

  constructor(file_path: string) {
    this.file_path = file_path;
    const [globals, ...requestsString] = fs.readFileSync(this.file_path).toString().split("###");
    if (!globals || requestsString.length === 0) throw new InvalidHttpFile(file_path, "Check syntax");
    this.variables = this.getVariables(globals ?? "");
    this.requests = this.parseRequests(requestsString).map((r) => new Req(r));
    const service = this.variables.host?.split("-movistar-empresas")?.[0];
    if (!service) throw new InvalidHttpFile(file_path, "Could not find host variable to determine service name");
    this.service = service;
    this.url = this.getUrl("cert", this.service);
  }

  private getEnvSufix(env: string) {
    if (env === "prod") return "";
    return `-${env}`;
  }

  private getUrl(env: string, service: string | null) {
    if (!service) return null;
    const sufix = this.getEnvSufix(env);
    const config = Config.get().openshift;
    return `http://${service}-movistar-empresas${sufix}.apps.${config.server_name}.cuyorh.tcloud.ar`;
  }

  private getVariables(globals: string) {
    return Object.fromEntries(
      globals.split("\n")
        .filter(line_filter)
        .map((l) => {
          const variable = this.getVariable(l);
          if (!variable?.key || !variable.value) return [];
          return [variable.key, variable.value];
        })
    );
  }

  private getHeader(l: string) {
    const split = l.split(":");
    if (split.length <= 1) return null;
    return { key: split[0], value: split?.[1]?.trim() };
  }

  public replaceVariables(string: string | undefined, options?: { quote_strings?: boolean }) {
    if (!this.variables || !string) return string;
    let res = string;
    Object.entries(this.variables).forEach(([k, v]) => {
      const value = options?.quote_strings && typeof v === "string" ? `"${v.replaceAll("\"", "")}"` : v;
      res = res.replaceAll(`{{${k}}}`, value);
    });
    return res;
  }

  private getVariable = (l: string) => {
    const line = l.replaceAll("#", "").replaceAll(" ", "");
    if (line.startsWith("@")) {
      const split = line.split("=");
      return { key: split?.[0]?.substring(1).trim(), value: split?.[1]?.trim() ?? null };
    }
    return null;
  };

  private parseRequests(requests: string[]) {
    return requests.map((r) => {
      if (r.trim() === "") return null;
      const lines = r.trim().split("\n");
      const method = lines?.[0]?.split(" ")[0];
      if (!method || !valid_methods.includes(method)) return null;
      let url = lines?.[0]?.split(" ")[1] ?? "";
      let i = 1;
      for (i; i < lines.length; i++) {
        const l = lines?.[i]?.trim();
        if (!l || l === "" || !l.startsWith("?") && !l.startsWith("&")) break;
        url = url?.concat(l);
      }
      const [path, searchParams] = url.split("?");
      const pathname = `/${path?.split("/").slice(3).join("/") ?? ""}`;
      const urlSearchParams = new URLSearchParams(searchParams);
      const params
        = urlSearchParams && urlSearchParams.size > 0
          ? Object.fromEntries(
            Object.entries(
              Object.fromEntries(urlSearchParams.entries())
            )
          ) : null;

      let headers: Record<string, string | null> | null = null;
      for (i; i < lines.length; i++) {
        const l = lines[i];
        if (!l || l.trim() === "") break;

        if (!headers) headers = {};
        const h = this.getHeader(l);
        if (!h) continue;
        const { key, value } = h;
        if (key && value) headers[key] = this.replaceVariables(value) || null;
      }

      let bodyString = "";
      for (i; i < lines.length; i++) {
        const l = lines[i];
        if (!l) continue;
        bodyString = bodyString.concat(l);
      }
      // bodyString = this.replaceVariables(bodyString)?.trim() ?? "";
      // Quizas algun dia se necesario parsear el body ... por ahora no
      // let body: Record<string, number | string> | null = null;
      // try {
      //   if (!bodyString) body = null;
      //   else body = JSON.parse(bodyString);
      // } catch {
      //   throw new InvalidJson(this.file_path);
      // }
      return { method, params, pathname, headers, body: bodyString };
    }
    ).filter((e) => e !== null);
  }
}

// class InvalidJson extends Error {
//   constructor(file_path: string) {
//     super(`Invalid json found at file ${file_path}`);
//   }
// }

class InvalidHttpFile extends Error {
  constructor(file_path: string, reason = "") {
    super(`Invalid http file ${file_path} ${reason}`);
  }
}
