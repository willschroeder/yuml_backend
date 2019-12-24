import {IngredientParse} from "../../parser/parser"
import {Singleton} from "../../singleton/singleton"
import {exceptionHandler} from "../../util/util"
import Debug from "debug"
import HttpErrors = require("http-errors")
import uuid = require("uuid")

const debug = Debug("*")

export class PostgresRecipeRepo {
    public async create(attr: { url: string, ingredients: Ingredient[], steps: string[] }): Promise<Recipe> {
        try {
            const query = `INSERT INTO recipes
            (uuid, url, recipe)
        VALUES ($1,$2,$3)
        RETURNING *`
            const id = uuid.v4() // TODO: make deterministic for url possibly
            const res = await Singleton.pg().query(query, [
                id,
                attr.url,
                JSON.stringify({
                    uuid: id,
                    ingredients: attr.ingredients,
                    steps: attr.steps
                })
            ])
            if (res.rows.length === 0) {
                throw new HttpErrors.InternalServerError("unable to create recipe")
            }

            return res.rows[0]
        } catch (e) {
            exceptionHandler(e, debug)
            throw e
        }
    }

    public async get(uuid: string) {
        try {
            const query = `SELECT * FROM recipes WHERE uuid=$1`

            const res = await Singleton.pg().query(query, [uuid])
            if (res.rows.length === 0) {
                return null
            }

            return res.rows[0]
        } catch (e) {
            exceptionHandler(e, debug)
            throw e
        }
    }
}

export type Recipe = {
    uuid: string
    ingredients: Ingredient[]
    steps: string[]
}

export type Ingredient = {
    text: string
    analysis: IngredientParse
}
