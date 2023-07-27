import type { State } from './helper';
import * as elements from 'typed-html';

export function Render(s: State) {
	console.log(5, s);
	const scope = s.pop();

	return <html>
		<head></head>
		<body>
			<h1>Hello World2</h1>
		</body>
	</html>
}