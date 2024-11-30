import { RouteContext } from '~/router/router';
import { shell } from "../$";

export async function loader({}: RouteContext) {
	return shell(<div style={{ display: "contents" }}>
		<h3>User Balance</h3>
		<p>Right click on the user's profile and check the balance of their account</p>
	</div>, { title: "User Balance Menu - Predictable Bot"});
}