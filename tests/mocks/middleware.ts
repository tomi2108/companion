import { DefaultBodyType, HttpResponseResolver, PathParams } from "msw";

import { unauthorized } from "./utils";

export function withAuth<P extends PathParams<keyof P>, Req extends DefaultBodyType, Res extends DefaultBodyType>(
  resolver: HttpResponseResolver<P, Req, Res>
) {
  return (input: Parameters<HttpResponseResolver<P, Req, Res>>[0]) => {
    const { request } = input;
    const authorization = request?.headers.get("Authorization");
    if (!authorization || authorization !== "Bearer mock_token") return unauthorized;
    return resolver(input);
  };
}
