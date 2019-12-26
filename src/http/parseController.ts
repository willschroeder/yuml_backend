import {Context} from "koa"
import {PythonRepo, RecipeWebsites} from "../repo/python"
import {Parser, Tokenizer} from "../parser/parser"
import {PostgresRecipeRepo, Recipe} from "../repo/postgres/recipe_repo"
import Joi = require("@hapi/joi")
import HttpErrors = require("http-errors")

const queryString = require('query-string')


export class ParseController {
    public post() {
        return async (ctx: Context) => {
            // Joi.assert(ctx.request.body,
            //     {email: Joi.string().uri()},
            //     new HttpErrors.UnprocessableEntity())

            const parsedUrl = queryString.parseUrl(ctx.request.query.url)
            let website: RecipeWebsites
            if (/allrecipes\.com/g.test(parsedUrl.url)) {
                website = RecipeWebsites.AllRecipes
            } else {
                throw new HttpErrors.NotImplemented("Does not support that website")
            }

            const pythonRepo = new PythonRepo()
            const parsedRecipe = await pythonRepo.scrapeRecipe(website, parsedUrl.url)

            const ingredients = parsedRecipe.ingredients.map((i) => {
                try {
                    const tokens = new Tokenizer(i).tokenize()
                    const parsed = new Parser(tokens).parse()
                    return {
                        text: i,
                        analysis: parsed
                    }
                } catch (e) {
                    console.log(e)
                    console.log(i)
                    return {
                        text: i,
                        analysis: {}
                    }
                }
            })

            const postgresRepo = new PostgresRecipeRepo()
            const savedRecipe = await postgresRepo.create({url: parsedUrl.url,
                ingredients: ingredients,
                steps: parsedRecipe.steps})

            ctx.status = 303
            ctx.redirect(`/v1/recipe/${savedRecipe.uuid}`)
            ctx.body = {
                uuid: savedRecipe.uuid
            }
        }
    }

    public get() {
        return async (ctx: Context) => {
            const postgresRepo = new PostgresRecipeRepo()
            const recipe = await postgresRepo.get(ctx.params.id)

            if (recipe === null) {
                ctx.status = 404
                return
            }
            console.log(ctx.params)
            ctx.body = JSON.stringify(recipe)
            // ctx.body = marked(recipeToMarkdown(recipe))
        }
    }
}

function recipeToMarkdown(r: Recipe): string {
    let md = []
    md.push("# Recipe Title")
    md.push("## Ingredients")
    md.push("|Text|Quantity|Unit|Ingredient|Prep Instructions|")
    md.push("|---|---|---|---|---|")
    for (const i of r.ingredients) {
        md.push(`|${i.text}|${i.analysis.quantity ?? ""}|${i.analysis.unit ?? ""}|${i.analysis.product ?? ""}|${i.analysis.preparationNotes ?? ""}|`)
    }
    md.push("")
    md.push("## Steps")
    for (const i of r.steps) {
        md.push(`* ${i}`)
    }
    return md.join("\n")
}
