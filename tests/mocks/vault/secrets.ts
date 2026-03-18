import { http } from "msw";
import z from "zod/v4";

import { bad_request, ok } from "../utils";

const schema = z.object({
  data: z.object()
});

export const secretHanlders = [
  http.post("*/v1/:project/data/:namespace/:name", async ({ request }) => {
    const clone = request.clone();
    const body = await clone.json();
    if (!schema.safeParse(body)) return bad_request;
    return ok;
  })
];
