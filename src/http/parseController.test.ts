import {createMockContext} from "@shopify/jest-koa-mocks"
import {ParseController} from "./parseController"
import {Factories} from "../test/factories"

it("should generate a recipe and redirect", async () => {
    const ctx = createMockContext({
        method: "POST",
        url: `/v1/parse/?url=https://www.allrecipes.com/recipe/220943/chef-johns-buttermilk-biscuits/`
    })

    const renderView = new ParseController().post()
    await renderView(ctx)

    expect(ctx.status).toBe(303)
    expect(ctx.redirect).toBeCalledWith(`/v1/recipe/${ctx.response.body.uuid}`)
})

it("should get a recipe", async() => {
    const recipe = await Factories.Recipe(true)
    const ctx = createMockContext({
        method: "GET",
        url: `/v1/recipe/${recipe.uuid}`
    })

    const renderView = new ParseController().get()
    await renderView(ctx, recipe.uuid)

    expect(JSON.parse(ctx.body)).toMatchObject(recipe)
})
