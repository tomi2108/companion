import { HttpResponse, JsonBodyType } from "msw";

export const ok = new HttpResponse(null, { status: 200 });
export const unauthorized = new HttpResponse("Unauthorized", { status: 401 });
export const bad_request = new HttpResponse("Bad Request", { status: 400 });
export const not_found = new HttpResponse("Not Found", { status: 404 });
export const json = (body: JsonBodyType) => HttpResponse.json(body);
