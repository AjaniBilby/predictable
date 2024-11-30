import * as fs from 'node:fs/promises';

import { RouteContext } from "~/router/router";
import { shell } from "~/website/routes/admin/logs/$";

export async function loader({}: RouteContext) {
	return shell(<div style="display: contents;">
		<h3>Bot Logs</h3>
		<textarea id="output-log" style={{width: "100%", height: "75vh"}} safe>
			{await fs.readFile("./log-bot.txt", "utf8")}
		</textarea>

		<script>
			var textarea = document.getElementById('output-log');
			textarea.scrollTop = textarea.scrollHeight;
		</script>
	</div>, { title: "Bot Logs - Admin Panel" });
}