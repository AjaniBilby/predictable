import { RouteTree } from "../router/index";
import * as Route0 from "./routes/_index";
import * as Route1 from "./routes/index";
import * as Route2 from "./routes/server.$serv.$user.history";
import * as Route3 from "./routes/server.$serv.$user";
import * as Route4 from "./routes/server.$serv._index";
import * as Route5 from "./routes/server.$serv.accounts";
import * as Route6 from "./routes/server.$serv";
import * as RootRoute from "./root";

export const Router = new RouteTree;
Router.ingest("_index.tsx", Route0, []);
Router.ingest("index.tsx", Route1, []);
Router.ingest("server.$serv.$user.history.tsx", Route2, []);
Router.ingest("server.$serv.$user.tsx", Route3, []);
Router.ingest("server.$serv._index.tsx", Route4, []);
Router.ingest("server.$serv.accounts.tsx", Route5, []);
Router.ingest("server.$serv.tsx", Route6, []);
Router.assignRoot(RootRoute);
