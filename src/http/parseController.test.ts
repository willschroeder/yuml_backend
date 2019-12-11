import {createMockContext} from "@shopify/jest-koa-mocks"
import {ParseController} from "./parseController"

it("should return a payment", async () => {

    const ctx = createMockContext({method: "GET", url: `/v1/parse/?url=https://www.allrecipes.com/recipe/220943/chef-johns-buttermilk-biscuits/`})

    const renderView = new ParseController().get()
    await renderView(ctx)

    const data = ctx.response.body
    console.log(data)
    expect(data).toBeDefined()
})
