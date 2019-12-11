import {Context} from "koa"
import {PythonRepo, RecipeWebsites} from "../repo/python"
import {IngredientParse, Parser, Tokenizer} from "../parser/parser"

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

            const ingredients = parsedRecipe.ingredients.map((i) => {
                try {
                    const tokens = new Tokenizer(i).tokenize()
                    const parsed = new Parser(tokens).parse()
                    return {
                        text: i,
                        analysis: parsed
                    }
                }
                catch(e) {
                    console.log(e)
                    console.log(i)
                    return {
                        text: i,
                        analysis: {}
                    }
                }
            })

            const recipe: Recipe = {
                ingredients: ingredients,
                steps: parsedRecipe.steps
            }

            ctx.body = JSON.stringify(recipe)
        }
    }
}

type Recipe = {
    ingredients: {
        text: string
        analysis: IngredientParse
    }[]
    steps: string[]
}
