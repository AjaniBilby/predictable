import { RenderMetaDescriptor, ShellOptions } from "htmx-router/shell";

export function Head<T>(props: { options: ShellOptions<T>, children: JSX.Element }) {
	return <head>
		{ RenderMetaDescriptor(props.options) as "safe" }
		{ props.children as "safe" }
	</head>;
}