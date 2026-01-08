import { InvalidHttpFile } from "@files/errors";

import { FileFormatter } from ".";

export const valid_methods = [
  "GET",
  "PUT",
  "POST",
  "PATCH",
  "DELETE"
] as const;

export type HttpMethod = typeof valid_methods[number];

export interface ReqObj {
  method: HttpMethod;
  params: Record<string, string | null> | null;
  pathname: string;
  headers: Record<string, string | null> | null;
  body: string;
}

export type HttpFileContent = {
  requests: ReqObj[];
  variables: Record<string, string>;
};

export class HttpFormatter implements FileFormatter<HttpFileContent> {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toString(_input: HttpFileContent): string {
    // TODO: implement Writing http files
    throw new Error("Writing http files is not implemented yet");
  }

  fromString(content: string): HttpFileContent {
    const [globals, ...requestsString] = content.split("###");
    const variables = this.getVariables(globals ?? "");
    const requests = this.parseRequests(requestsString);
    return { requests, variables };
  }

  private parseRequests(requests: string[]) {
    return requests.map((r) => {
      if (r.trim() === "") return null;
      const lines = r.trim().split("\n");
      const method = lines?.[0]?.split(" ")[0];
      if (!method || !valid_methods.includes(method as HttpMethod)) return null;
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
        if (key && value) headers[key] = value;
      }

      let bodyString = "";
      for (i; i < lines.length; i++) {
        const l = lines[i];
        if (!l) continue;
        bodyString = bodyString.concat(l);
      }
      return { method: method as HttpMethod, params, pathname, headers, body: bodyString };
    }
    ).filter((e) => e !== null);
  }

  private getVariable = (l: string) => {
    const line = l.replaceAll("#", "").replaceAll(" ", "");
    if (!line.startsWith("@")) return null;
    const split = line.split("=");
    return { key: split?.[0]?.substring(1).trim(), value: split?.[1]?.trim() ?? null };
  };

  private getHeader(l: string) {
    const split = l.split(":");
    if (split.length <= 1) return null;
    return { key: split[0], value: split?.[1]?.trim() };
  }

  private getVariables(globals: string) {
    const line_filter = (l: string) => l !== "" && l !== "###" && !l.includes("localhost") && l !== "\n";
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

  exception(path: string): Error | void {
    return new InvalidHttpFile(path);
  }
}
