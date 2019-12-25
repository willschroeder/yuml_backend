import uuidv4 = require("uuid/v4")
import {PostgresRecipeRepo, Recipe} from "../repo/postgres/recipe_repo"
import Faker = require("faker")

export class Factories {
    public static Uuid(): string {
        return uuidv4()
    }

    public static async Recipe(persist = false): Promise<Recipe> {
        const obj = {
            ingredients: [],
            steps: ["Eat the burrito"],
            url: `https://test.com/recipe/${Faker.random.uuid()}`
        }

        if (persist) {
            const repo = new PostgresRecipeRepo()
            return await repo.create(obj)
        }

        return {...obj, uuid: Factories.Uuid()}
    }
}
