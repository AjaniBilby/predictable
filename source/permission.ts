import { prisma } from "./db";

export async function HasPredictionPermission(
	predictionID: string,
	userID: string,
	roles: string[]
): Promise<boolean> {
	const prediction = await prisma.prediction.findFirst({
		where: {
			id: predictionID
		}
	});

	if (!prediction) return false;
	if (prediction.authorID == userID) return true;

	// TODO rolls check

	return false;
}