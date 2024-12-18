import { shell } from "~/routes/admin/logs/$";

export async function loader() {
	return shell(<ul>
		<li><a href="/admin/logs/website">Website</a></li>
		<li><a href="/admin/logs/bot">Bot</a></li>
		<li><a href="/admin/logs/all">All</a></li>
	</ul>);
}