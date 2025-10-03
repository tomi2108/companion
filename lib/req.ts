type ReqObj = {
  method: string;
  params: Record<string, string | null> | null;
  pathname: string;
  headers: Record<string, string | null> | null;
  body: string;
};

export class Req {
  method: string;
  params: Record<string, string | null> | null;
  pathname: string;
  headers: Record<string, string | null> | null;
  body: string;

  constructor(reqObj: ReqObj) {
    this.pathname = reqObj.pathname;
    this.params = reqObj.params;
    this.method = reqObj.method;
    this.headers = reqObj.headers;
    this.body = reqObj.body;
  }

  replaceableVariables() {
    const res: string[] = [];
    const varRegex = new RegExp("{{(.*)}}", "g");
    res.push(...this.pathname.matchAll(varRegex).map((m) => m?.[1] ?? ""));
    res.push(
      ...this.params
        ? Object.entries(this.params)
          .flatMap(
            ([, v]) => v ? [...v.matchAll(varRegex).map((m) => m?.[1] ?? "")] : []
          )
        : []
    );
    return res;
  }
}
