import {createMockContext} from "@shopify/jest-koa-mocks"
import {ParseController} from "./parseController"

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


