import ReactDOM from 'react-dom/client';

function MyComponent(props: { title: string, data: string }) {
	return <div>
		<h1 safe>{props.title}</h1>
		<p safe>{props.data}</p>
	</div>;
}

function Render() {
	const rootElement = document.getElementById('my-react-root');
	const root = ReactDOM.createRoot(rootElement);
	root.render(<MyComponent title="Hello, React!" data="Some interesting data" />);
}