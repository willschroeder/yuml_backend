import {createMockContext} from "@shopify/jest-koa-mocks"
import {IndexController} from "./index_controller"

describe("index controller", () => {
    it("should return hello world", async () => {
        const ctx = createMockContext({method: "GET", url: "/"})

        const renderView = new IndexController().get()
        await renderView(ctx)

        const data = ctx.response.body
        expect(data.hello).toEqual("world")
    })
})
