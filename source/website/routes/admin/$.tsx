import * as root from "~/website/routes/$";
import { prisma } from "~/db";

export const parameters = {};

export async function CheckAdmin(userID: string) {
	const user = await prisma.user.findFirst({
		select: { isAdmin: true },
		where: { id: userID },
	});

	return user && user.isAdmin;
}

export async function EnforceAdmin(userID: string) {
	if (!CheckAdmin(userID)) throw new Response("Unauthorised Access", { status: 401, statusText: 'Unauthorised' });
	return;
}


export async function shell(inner: JSX.Element, options?: { title?: string }) {
	options ??= {};
	options.title ??= "Admin Panel";

	return root.shell(<div style="display: contents;">
		<h1><a href="/admin" style="color: inherit; text-decoration: none;">Admin Panel</a></h1>
		{inner}
	</div>);
}