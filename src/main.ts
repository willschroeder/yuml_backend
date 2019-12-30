import Koa = require("koa")
import koaBody = require("koa-body")
import Route = require("koa-route")
import Router = require("koa-router");
import Debug from "debug"
import {exceptionHandler} from "./util/util"
import {Singleton} from "./singleton/singleton"
import {IndexController} from "./http/index_controller"
import {ParseController} from "./http/parseController"

const debug = Debug("yuml:main")
const args = process.argv.slice(2)

function commandsPresent(): boolean {
    return (args.length > 0 && args[0] === "command")
}

function isMain(): boolean {
    return require.main === module
}

async function koaErrorLogger(ctx: Koa.ParameterizedContext, next: () => Promise<any>) {
    try {
        await next()
    } catch (err) {
        if (err.isJoi) {
            ctx.status = 422
            ctx.body = err.details[0].message
            return
        }

        ctx.status = err.status || 500

        if (process.env.NODE_ENV !== "production") {
            ctx.body = err.message
        }

        if (ctx.status >= 500) {
            exceptionHandler(err, debug)
        }
    }
}

export const koa = new Koa()
const router = new Router();

koa.use(koaBody())
koa.use(koaErrorLogger)

router.get("/", new IndexController().get())
router.post("/v1/parse", new ParseController().post())
router.get("/v1/recipe/:id", new ParseController().get())
router.get("/v1/recipe/:id/:style", new ParseController().get())

koa.use(router.routes()).use(router.allowedMethods())

if (isMain() && !commandsPresent()) {
    const httpPort = process.env.HTTP_PORT || 3000
    debug(`Serving HTTP on ${httpPort}`)
    koa.listen(httpPort)
}

export async function runCommand(commands: string[]) {
    if (commands.length === 0) {
        debug("No command provided")
    }

    switch (commands[0]) {
        case "migrate": {
            debug("Running pg migration")
            const appliedMigrations = await Singleton.postgrator().migrate()
            debug(appliedMigrations)
            break
        }

        case "drop": {
            debug("Deleting all tables")
            if (process.env.NODE_ENV === "production") {
                debug("DONT RUN THIS ON PRODUCTION!")
            }

            debug(await Singleton.pg().query("DROP SCHEMA IF EXISTS PUBLIC CASCADE; CREATE SCHEMA IF NOT EXISTS PUBLIC;"))
            debug("Deleting finished.")
            break
        }
    }
}

if (commandsPresent()) {
    runCommand(args.slice(1))
        .then(() => {
            process.exit(0)
        })
        .catch((e) => {
            exceptionHandler(e, debug)
            process.exit(1)
        })
}
