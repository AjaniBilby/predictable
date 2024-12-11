import { shell } from "~/website/routes/guide/$";

export async function loader() {
	return shell(<div style="display: contents;">
		<h2>Managing Permissions</h2>
		<p>
			By default when the bot is added to the server anyone can create a prediction, and only those who created it can manage it.
		</p>
		<p>
			There are two secret commands for the bot which only show up for users who are a server admin.
		</p>

		<h3>Permission</h3>
		<p>
			This command allows you to add/remove users or roles from being able to manage other people's predictions.
		</p>
		<p>
			This is not to be confused with the "/prediction permission" command which anyone can use to see who has management permissions
		</p>

		<h3>Lock</h3>
		<p>
			This allows you to prevent anyone without management permissions from creating predictions.
		</p>
		<p>
			By default anyone can create a prediction, but only it's creators and managers can manage over it.
		</p>
		<p>
			If the bot is restricted only managers can create and manage predictions.
		</p>
	</div>, { title: "Managing Permissions - Predictable Bot" })
}