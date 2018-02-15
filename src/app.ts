import Koa from "koa";
import bodyParser from "koa-bodyparser";
import compress from "koa-compress";
import favicon from "koa-favicon";
import error from "koa-json-error";
import redisStore from "koa-redis";
import session from "koa-session";
import serve from "koa-static";
import path from "path";
import nconf from "./lib/config";
import { sequelize } from "./lib/database";
import logger from "./lib/logger";
import renderPage from "./routes/page";

const app = new Koa();
app.keys = [nconf.get("app:cookieSecret")];
app.use(session({ store: redisStore({}) }, app));
app.use(compress());
app.use(favicon(path.join(__dirname, "../public/images/favicon.ico")));
app.use(bodyParser());
app.use(serve(path.join(__dirname, "../public")));
app.use(error());
app.use(renderPage);

export default app;

async function start() {
    await sequelize.sync();

    const server = app.listen(nconf.get("app:port") || 3000, () => {
        logger.info("Paradise server listening on port " + server.address().port);
    });
}

start().catch((err: Error) => {
    logger.error(err.message);
});