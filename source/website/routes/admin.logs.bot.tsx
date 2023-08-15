import { RenderArgs } from "htmx-router";
import * as elements from '@kitajs/html';
import * as fs from 'node:fs/promises';


export async function Render(rn: string, {setTitle}: RenderArgs) {
	setTitle("Bot Logs - Admin Panel");

	return <div id={rn}>
		<h3>Bot Logs</h3>
		<textarea id="output-log" style={{width: "100%", height: "75vh"}}>
			{await fs.readFile("./log-bot.txt")}
		</textarea>

		<script>
			var textarea = document.getElementById('output-log');
			textarea.scrollTop = textarea.scrollHeight;
		</script>
	</div>;
}