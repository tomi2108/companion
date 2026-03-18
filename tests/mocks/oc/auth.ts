import { http, HttpResponse } from "msw";

import { bad_request } from "@mocks/utils";

export const mockOCToken = "mock_token";
export const authHandlers = [
  http.get("*/oauth/authorize", ({ request }) => {
    const redirectUri = new URL(request.url).searchParams.get("redirect_uri");
    if (redirectUri) return new HttpResponse(null, {
      status: 302,
      headers: { Location: `${redirectUri}#access_token=${mockOCToken}&token_type=bearer&expires_in=3600` }
    });
    return bad_request;
  })
];
