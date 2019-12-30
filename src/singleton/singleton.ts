import {resolveEnvironment, isDevelopmentOrTestEnvironment} from "../util/util"
import Debug from "debug"
import PG = require("pg")
import Postgrator = require("postgrator")

const debug = Debug("yuml:singleton")

export class Singleton {
    private static pgInst: PG.Pool
    private static postgratorInst: Postgrator

    private constructor() {

    }

    public static pg() {
        if (!Singleton.pgInst) {
            if (isDevelopmentOrTestEnvironment()) {
                Singleton.pgInst = new PG.Pool({
                    port: Singleton.resolvePort(process.env.POSTGRES_PORT, 5432),
                    host: process.env.POSTGRES_HOST || "localhost",
                    user: process.env.POSTGRES_USER || "root",
                    password: process.env.POSTGRES_PASSWORD || "root",
                    database: process.env.POSTGRES_DB || `yuml_${resolveEnvironment()}`,
                })
            }
            else {
                Singleton.pgInst = new PG.Pool({
                    connectionString: process.env.DATABASE_URL,
                    ssl: true,
                })
            }
        }

        return Singleton.pgInst
    }

    public static postgrator() {
        if (!Singleton.postgratorInst) {
            if (isDevelopmentOrTestEnvironment()) {
                Singleton.postgratorInst = new Postgrator({
                    migrationDirectory: require("path").resolve("./src/migrations"),
                    driver: "pg",
                    host: process.env.POSTGRES_HOST || "localhost",
                    port: Singleton.resolvePort(process.env.POSTGRES_PORT, 5432),
                    user: process.env.POSTGRES_USER || "root",
                    password: process.env.POSTGRES_PASSWORD || "root",
                    database: process.env.POSTGRES_DB || `yuml_${resolveEnvironment()}`,
                    schemaTable: "migrations",
                })
            }
            else {
                Singleton.postgratorInst = new Postgrator({
                    driver: "pg",
                    connectionString: process.env.DATABASE_URL,
                    ssl: true,
                    migrationDirectory: require("path").resolve("./src/migrations"),
                    schemaTable: "migrations",
                })
            }

            Singleton.postgratorInst.on("validation-started", (migration) => debug(migration))
            Singleton.postgratorInst.on("validation-finished", (migration) => debug(migration))
            Singleton.postgratorInst.on("migration-started", (migration) => debug(migration))
            Singleton.postgratorInst.on("migration-finished", (migration) => debug(migration))
        }

        return Singleton.postgratorInst
    }


    public static resolvePort(envVar: string | undefined, defaultPort: number): number {
        if (envVar === undefined) {
            return defaultPort
        } else {
            return parseInt(envVar as string, 10)
        }
    }

}
