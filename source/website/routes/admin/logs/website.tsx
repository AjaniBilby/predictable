import * as fs from "node:fs/promises";

import { shell } from "~/website/routes/admin/logs/$";

export async function loader() {
	return shell(<div style="display: contents;">
		<h3>Website Logs</h3>
		<textarea id="output-log" style={{width: "100%", height: "75vh"}} safe>
			{await fs.readFile("./log-web.txt", "utf8")}
		</textarea>

		<script>
			var textarea = document.getElementById('output-log');
			textarea.scrollTop = textarea.scrollHeight;
		</script>
	</div>, { title: "Website Logs - Admin Panel" });
}