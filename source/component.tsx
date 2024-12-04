export function Foo(props: { eager: boolean }) {
	if (props.eager) return <div>Rendered on the server</div>;
	return <div>Rendered on the client</div>;
}