import {Context} from "koa"
import {PythonRepo, RecipeWebsites} from "../repo/python"

const queryString = require('query-string')

export class RecipeController {
    public get() {
        return async (ctx: Context) => {
            const parsed = queryString.parseUrl(ctx.request.query.recipe)
            console.log(parsed.url)
            console.log(parsed.query.referringContentType)

            const regex = /allrecipes\.com/g
            console.log(regex.test(parsed.url))

            const repo = new PythonRepo()
            const parsedRecipe = await repo.scrapeRecipe(RecipeWebsites.AllRecipes, parsed.url)

            ctx.body = parsedRecipe
        }
    }
}

