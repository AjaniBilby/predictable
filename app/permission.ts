import { Prediction } from "@prisma/client";
import { prisma } from "./db";

export async function HasPredictionPermission(
	prediction: Prediction,
	userID: string,
	roles: string[]
): Promise<boolean> {
	if (prediction.authorID == userID) return true;

	const guild = await prisma.guild.findFirst({
		where: {
			id: prediction.guildID
		},
		include: {
			adminUsers: {
				where: { userID }
			},
			adminRoles: {
				where: { roleID: { in: roles } }
			}
		}
	});

	if (!guild) return false;
	if (guild.adminUsers.length > 0) return true;
	if (guild.adminRoles.length > 0) return true;

	return false;
}