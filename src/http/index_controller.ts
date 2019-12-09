import {Context} from "koa"

export class IndexController {
    public get() {
        return (ctx: Context) => {
            ctx.body = {
                hello: "world",
                name: "yuml"
            }
        }
    }
}
