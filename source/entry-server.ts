import "./bot/index";
import { BuildClient } from "./builder";
import { tree } from "./website/router";
export { tree };



BuildClient().catch(console.error);