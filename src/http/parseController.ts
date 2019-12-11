import {Context} from "koa"
import {PythonRepo, RecipeWebsites} from "../repo/python"
import {Ingredient, Parser, Tokenizer} from "../parser/parser"

const queryString = require('query-string')

export class ParseController {
    public get() {
        return async (ctx: Context) => {
            const parsed = queryString.parseUrl(ctx.request.query.url)
            console.log(parsed.url)
            console.log(parsed.query.referringContentType)

            const regex = /allrecipes\.com/g
            console.log(regex.test(parsed.url))

            const repo = new PythonRepo()
            const parsedRecipe = await repo.scrapeRecipe(RecipeWebsites.AllRecipes, parsed.url)

            const ingreidents = parsedRecipe.ingredients.map((i) => {
                try {
                    const tokens = new Tokenizer(i).tokenize()
                    return new Parser(tokens).parse()
                }
                catch(e) {
                    console.log(e)
                    console.log(i)
                    return {

                    }
                }
            })

            const recipe: Recipe = {
                ingredients: ingreidents,
                steps: parsedRecipe.steps
            }

            ctx.body = recipe
        }
    }
}

type Recipe = {
    ingredients: Ingredient[]
    steps: string[]
}
