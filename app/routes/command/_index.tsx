import { shell } from "./$";

export async function loader() {
	return shell(<div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "space-around" }}>
		<div title="Commands starting with /predict">
			<b>Predict Commands</b>
			<ul style={{ margin: "0" }}>
				<li><a href="/command/auto-refund"><code>auto-refund</code></a></li>
				<li><a href="/command/balance"><code>balance</code></a></li>
				<li><a href="/command/bankrupt"><code>bankrupt</code></a></li>
				<li><a href="/command/create"><code>create</code></a></li>
				<li><a href="/command/info"><code>info</code></a></li>
				<li><a href="/command/invite"><code>invite</code></a></li>
				<li><a href="/command/leaderboard"><code>leaderboard</code></a></li>
				<li><a href="/command/list"><code>list</code></a></li>
				<li><a href="/command/login"><code>login</code></a></li>
				<li><a href="/command/permissions"><code>permissions</code></a></li>
				<li><a href="/command/transfer"><code>transfer</code></a></li>
				<li><a href="/command/version"><code>version</code></a></li>
			</ul>
		</div>
		<div title="slash command">
			<b>Root Commands</b>
			<ul style={{ margin: "0" }}>
				<li><a href="/command/lock"><code>lock</code></a></li>
				<li><a href="/command/mint"><code>mint</code></a></li>
				<li><a href="/command/permission"><code>permission</code></a></li>
			</ul>
		</div>
		<div title="Right Click on Message actions">
			<b>Message Menus</b>
			<ul style={{ margin: "0" }}>
				<li><a href="/command/menu/lock"><code>lock</code></a></li>
				<li><a href="/command/menu/mark"><code>mark</code></a></li>
				<li><a href="/command/menu/payout"><code>payout</code></a></li>
				<li><a href="/command/menu/refund"><code>refund</code></a></li>
				<li><a href="/command/menu/unlock"><code>unlock</code></a></li>
			</ul>
		</div>
		<div title="Right Click on Profile actions">
			<b>User Menus</b>
			<ul style={{ margin: "0" }}>
				<li><a href="/command/menu/balance"><code>balance</code></a></li>
				<li><a href="/command/menu/profile"><code>profile</code></a></li>
			</ul>
		</div>
	</div>);
}