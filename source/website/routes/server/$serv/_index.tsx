import { GetGuild, GetMember } from "~/website/shared/discord";
import { RouteContext } from "~/router";
import { AccountCard } from "~/website/component/account-card";
import { isPayable } from "~/prediction-state";
import { prisma } from "~/db";


import { PredictionList } from "~/website/routes/server/$serv/poll";
import { shell } from "./$";

export async function loader({ params }: RouteContext) {
	const data = await prisma.guild.findFirst({
		where: { id: params.serv },
		include: {
			predictions: {
				include: {
					options: true,
					wagers: true
				},
				orderBy: [
					{ updatedAt: "desc" }
				]
			},
			accounts: {
				orderBy: [
					{ balance: "desc" }
				],
				take: 6
			}
		}
	});
	if (!data) return null;


	const openWagers = data.predictions
	.filter(x => isPayable(x.status))
	.sort((a, b) => b.wagers.length - a.wagers.length);

	const liquid = data.accounts.reduce((s, x) => x.balance+s, 0);
	const bets   = data.predictions.reduce((s, x) => x.wagers.reduce((s, x) => x.amount+s, s), 0);
	const assets = openWagers.reduce((s, x) => x.wagers.reduce((s, x) => x.amount+s, s), 0);


	const guild = await GetGuild(params.serv, {});

	const accounts: JSX.Element[] = await Promise.all(data.accounts.map(async x => {
		return <AccountCard member={await GetMember(x.guildID, x.userID, {})} account={x} />;
	}));

	return shell(<div style="display: contents;">
		<div style={{display: 'flex', flexDirection: "column", alignItems: "flex-start"}}>
			<h3>Statistics</h3>
			<div style={{display: "grid", gridTemplateColumns: "auto auto auto", gap: "5px 10px"}}>
				<div>Liquid</div>
				<div>$</div>
				<div style='text-align: right;'>{liquid}</div>
				<div>Betting</div>
				<div>$</div>
				<div style='text-align: right;'>{assets}</div>
				<div>Net</div>
				<div>$</div>
				<div style='text-align: right;'>{liquid + assets}</div>

				<div style='grid-column: span 3; height: 0.5em'></div>
				<div>All time bets</div>
				<div>$</div>
				<div style='text-align: right;'>{bets}</div>
			</div>
		</div>

		<h3>Open Predictions</h3>
		<PredictionList server={params.serv} predictions={openWagers}/>


		<h3>Past Predictions</h3>
		<a href={`/server/${params.serv}/polls`} class="expandable">
			<div class="content" style={{
				display: "grid",
				gridTemplateColumns: "auto 1fr",
				gap: "5px 0px"
			}}>
				{data.predictions.filter(x => !isPayable(x.status)).slice(0, 5).map(pred => <>
					<div style={{
						display: "flex",
						backgroundColor: "var(--color-purple)",
						borderRadius: "5px 0 0 5px",
						justifyContent: "center",
						fontWeight: "bold",
						overflow: "hidden",
						fontSize: "0.8em",
					}}>
						<div title="Total Bets" style={{
							display: "flex",
							alignItems: "center",
							padding: "3px 10px",
							color: "white",
							fontSize: "1.2em",
						}}>
							${pred.wagers.reduce((x, s) => s.amount + x, 0)}
						</div>
					</div>
					<div style={{
						boxShadow: "inset 0px 0px 5px 0px #0003",
						borderRadius: "0 5px 5px 0",
						padding: "5px 10px",
						fontWeight: "bold",
						overflow: "hidden",
						color: "var(--text-color)",
						fontSize: "0.8em"
					}}>
						<div safe>{pred.title}</div>
						<hr style={{height: "1px", margin: "3px 0px", borderWidth: "0px", backgroundColor: "var(--text-color)", opacity: "20%"}} />
						<div style={{marginLeft: "10px", fontWeight: "200", fontStyle: "italic", fontSize: "0.8em"}}>
							{pred.options.filter(x => x.correct).map(x => <div safe>{x.text}</div>)}
						</div>
					</div>
				</>)}
			</div>
			<div class="grey"></div>
		</a>

		<h3>{data.accounts.length} Members</h3>
		<a href={`/server/${params.serv}/leaderboard`} class="expandable">
			<div class="content" style={{
				display: "grid",
				gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
				gap: "10px"
			}}>{accounts}</div>
			<div class="grey"></div>
		</a>
	</div>, guild);
}