import * as html from '@kitajs/html';
import { Link } from 'htmx-router';


export async function Render(rn: string) {

	return <div id={rn} style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "space-around" }}>
		<div title="Commands starting with /predict">
			<b>Predict Commands</b>
			<ul style={{ margin: "0" }}>
				<li><Link to="/command/auto-refund"><code>auto-refund</code></Link></li>
				<li><Link to="/command/balance"><code>balance</code></Link></li>
				<li><Link to="/command/bankrupt"><code>bankrupt</code></Link></li>
				<li><Link to="/command/create"><code>create</code></Link></li>
				<li><Link to="/command/info"><code>info</code></Link></li>
				<li><Link to="/command/invite"><code>invite</code></Link></li>
				<li><Link to="/command/leaderboard"><code>leaderboard</code></Link></li>
				<li><Link to="/command/list"><code>list</code></Link></li>
				<li><Link to="/command/login"><code>login</code></Link></li>
				<li><Link to="/command/permissions"><code>permissions</code></Link></li>
				<li><Link to="/command/transfer"><code>transfer</code></Link></li>
				<li><Link to="/command/version"><code>version</code></Link></li>
			</ul>
		</div>
		<div title="slash command">
			<b>Root Commands</b>
			<ul style={{ margin: "0" }}>
				<li><Link to="/command/lock"><code>lock</code></Link></li>
				<li><Link to="/command/mint"><code>mint</code></Link></li>
				<li><Link to="/command/permission"><code>permission</code></Link></li>
			</ul>
		</div>
		<div title="Right Click on Message actions">
			<b>Message Menus</b>
			<ul style={{ margin: "0" }}>
				<li><Link to="/command/menu/lock"><code>lock</code></Link></li>
				<li><Link to="/command/menu/mark"><code>mark</code></Link></li>
				<li><Link to="/command/menu/payout"><code>payout</code></Link></li>
				<li><Link to="/command/menu/refund"><code>refund</code></Link></li>
				<li><Link to="/command/menu/unlock"><code>unlock</code></Link></li>
			</ul>
		</div>
		<div title="Right Click on Profile actions">
			<b>User Menus</b>
			<ul style={{ margin: "0" }}>
				<li><Link to="/command/menu/balance"><code>balance</code></Link></li>
				<li><Link to="/command/menu/profile"><code>profile</code></Link></li>
			</ul>
		</div>
	</div>;
}