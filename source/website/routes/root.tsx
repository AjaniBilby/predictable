import type { State } from '../types';
import * as elements from 'typed-html';

export function Render(s: State) {
	const scope = s.pop();

	return <html>
		<head></head>
		<body>
			<h1>Hello World2</h1>
		</body>
	</html>
}