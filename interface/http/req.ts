import axios from "axios";

import { HttpMethod, ReqObj } from "@files/formatters/http_formatter";
import { Choice } from "@lib/constants";

export const varRegex = new RegExp("{{(.*?)}}", "g");

export class Req implements ReqObj {
  method: HttpMethod;
  params: Record<string, string | null> | null;
  pathname: string;
  headers: Record<string, string | null> | null;
  body: string;
  variables: Record<string, string>;

  constructor(reqObj: ReqObj, variables = {}) {
    this.pathname = reqObj.pathname;
    this.params = reqObj.params;
    this.method = reqObj.method;
    this.headers = reqObj.headers;
    this.body = reqObj.body;
    this.variables = variables;
  }

  async send(url: string, variables?: Record<string, string>) {
    const vars = this.replaceableVariables();
    const replace = variables ? { ...this.variables, ...Object.fromEntries(vars.map((v) => [v, variables[v] ?? null])) } : this.variables;

    const req_config = {
      method: this.method,
      params: Object.fromEntries(
        Object.entries(
          this.params ?? {}
        ).map(([k, v]) => [k, v ? this.replaceVariables(v, { variables: replace }) : undefined])),
      headers: this.headers ?? {},
      url: `${url}${this.replaceVariables(this.pathname, { variables: replace })}`,
      data: JSON.parse(this.replaceVariables(this.body, { quote_strings: true, variables: replace }) ?? "{}")
    };

    const res = await axios.request(req_config);
    return { res, config: req_config };
  }

  public replaceVariables(string: string, options?: { quote_strings?: boolean; variables?: Record<string, string | null> }) {
    let res = string;
    Object.entries({ ...this.variables, ...options?.variables })
      .forEach(([k, v]) => {
        const value = options?.quote_strings && typeof v === "string" ? `"${v.replaceAll("\"", "")}"` : v;
        res = res?.replaceAll(`{{${k}}}`, value ?? "null");
      });
    return res;
  }

  private replaceableVariables() {
    const res: string[] = [];
    res.push(...this.pathname.matchAll(varRegex).map((m) => m?.[1] ?? ""));
    res.push(...this.body.matchAll(varRegex).map((m) => m?.[1] ?? ""));
    res.push(
      ...this.params
        ? Object.entries(this.params)
          .flatMap(
            ([, v]) => v ? [...v.matchAll(varRegex).map((m) => m?.[1] ?? "")] : []
          )
        : []
    );
    return Array.from(new Set(res));
  }

  toString() {
    return `${this.method} ${this.pathname}`;
  }

  toChoice(): Choice {
    return { name: this.toString() };
  }
}
