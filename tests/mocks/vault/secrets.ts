import { http } from "msw";

import { bad_request, ok } from "../utils";

export const secretHanlders = [
  http.post("*/v1/:project/data/:namespace/:name", async ({ request }) => {
    const clone = request.clone();
    const body = await clone.json();
    if (
      !body
      || !body.data
      || typeof body.data !== "object"
    ) return bad_request;
    return ok;
  })
];
