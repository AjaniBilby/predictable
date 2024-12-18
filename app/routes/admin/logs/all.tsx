import * as fs from "node:fs/promises";

import { shell } from "~/routes/admin/logs/$";

export async function loader() {
	return shell(<div style="display: contents;">
		<h3>All Logs</h3>
		<textarea id="output-log" style={{width: "100%", height: "75vh"}} safe>
			{await fs.readFile("./log-all.txt", "utf8")}
		</textarea>

		<script>
			var textarea = document.getElementById('output-log');
			textarea.scrollTop = textarea.scrollHeight;
		</script>
	</div>, { title: "Bot Logs - Admin Panel" });
}