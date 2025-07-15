import { HttpResponse, JsonBodyType } from "msw";

export const ok = new HttpResponse(null, { status: 200 });
export const unauthorized = new HttpResponse("Unauthorized", { status: 401 });
export const bad_request = new HttpResponse("Bad Request", { status: 400 });
export const json = (body: JsonBodyType) => HttpResponse.json(body);
