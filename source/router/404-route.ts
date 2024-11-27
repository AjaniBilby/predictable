import { ErrorResponse, RenderArgs } from "./shared";

export async function Render({request}: RenderArgs): Promise<string> {
	throw new ErrorResponse(404, "Resource Not Found", request.url || "/");
}