import Koa = require("koa")
import Debug from "debug"
import {exceptionHandler} from "./util/util"
import {Singleton} from "./singleton/singleton"
import koaBody = require("koa-body")
import Route = require("koa-route")
import {IndexController} from "./http/index_controller"

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
koa.use(koaBody())
koa.use(koaErrorLogger)
koa.use(Route.get("/", new IndexController().get()))

if (isMain() && !commandsPresent()) {
    koa.listen(3000)
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
