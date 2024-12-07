import { RouteContext } from "~/router";
import { shell } from "../$";

export async function loader({}: RouteContext) {
	return shell(<div style={{ display: "contents" }}>
		<h3>User Profile</h3>
		<p>Right click on the user's profile and get a link to see the user's profile on the companion site</p>
	</div>, { title: "Profile Menu - Predictable Bot"});
}