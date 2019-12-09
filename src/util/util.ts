import Debug from "debug"
import HttpErrors = require("http-errors")
import util = require("util")

const debug = Debug("benjamins:util")

export function exceptionHandler(e: Error, debugInst: Debug.Debugger) {
    if (!e) {
        throw new Error("Undefined exception given to exceptionHandler")
    }
    if (isTestEnvironment()) {
        /* tslint:disable */
        console.log(e)
        /* tslint:enable */
    } else {
        debugInst(e)
    }
}

export function stringToEnum<T>(enumObj: T, str: string | number): T {
    const key: T | undefined = (enumObj as any)[str]
    if (key !== undefined) {
        return key
    }
    throw new HttpErrors.UnprocessableEntity(`unable to convert ${str} to enum`)
}

export function resolveEnvironment(): string {
    if (process.env.NODE_ENV === undefined) {
        return "development"
    } else {
        return process.env.NODE_ENV as string
    }
}

export function isTestEnvironment(): boolean {
    return resolveEnvironment() === "test"
}

export function isProudctionEnvironment(): boolean {
    return resolveEnvironment() === "test"
}

export function isDevelopmentOrTestEnvironment(): boolean {
    return resolveEnvironment() === "test" || resolveEnvironment() === "development"
}

export async function sleep(ms: number) {
    await util.promisify(setTimeout)(ms)
}

export function unixTimestamp(date?: Date): number {
    date = date || (new Date())
    return Math.floor(date.getTime() / 1000.0)
}
