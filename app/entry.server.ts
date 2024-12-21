import { RenderMetaDescriptor, ShellOptions } from "htmx-router";
import { tree } from "~/router";

import "~/bot/index";

export function Meta<T>(props: { options: ShellOptions<T> }) {
	return RenderMetaDescriptor(props.options) as "safe";
}

export { tree };