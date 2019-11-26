import {Ingredient, Parser, Tokenizer} from "./parser"

const tests: {text: string, answer: Ingredient}[] = [
    {
        text: "1 1/2 cups finely chopped red onions",
        answer: {
            product: "red onions",
            quantity: 1.5,
            unit: "cups",
            preparationNotes: "finely chopped"
        }
    },
    {
        text: "1 1/2 tsp red onions finely chopped",
        answer: {
            product: "red onions",
            quantity: 1.5,
            unit: "tsp",
            preparationNotes: "finely chopped"
        }
    },
    {
        text: "2 1/2 tablespoons finely chopped parsley",
        answer: {
            product: "parsley",
            quantity: 2.5,
            unit: "tablespoons",
            preparationNotes: "finely chopped"
        }
    },
    {
        text: "3 large Granny Smith apples", // TODO large is a size modifier
        answer: {
            product: "large granny smith apples",
            quantity: 3,
        }
    },
    // {
    //     text: "1 pound carrots, young ones if possible",
    //     /*
    //         TODO needs to split carrots off after noun, dont let values be re-set.
    //
    //         1 pound finely chopped carrots, young ones if possible
    //
    //         IDEAL
    //         1 pound carrots, finely chopped, young ones if possible
    //
    //         is the first noun grouping (that isnt a unit)  assumed to be the ingredient?
    //         maybe everything after the first comma/sentence break is descriptions
    //      */
    //     answer: {
    //         product: "red onions",
    //         quantity: 1.5,
    //         unit: "cups",
    //         preparationNotes: "finely chopped"
    //     }
    // },
    {
        text: "Kosher salt, to taste",
        answer: {
            product: "kosher salt",
            preparationNotes: "to taste"
        }
    },
    {
        text: "2 tablespoons sherry vinegar",
        answer: {
            product: "sherry vinegar",
            quantity: 2,
            unit: "tablespoons"
        }
    },
    {
        text: "2 tablespoons honey",
        answer: {
            product: "honey",
            quantity: 2,
            unit: "tablespoons",
        }
    },
    // {
    //     text: "2 tablespoons extra-virgin olive oil", // TODO Unable to start with a tag Adjective
    //     answer: {
    //         product: "red onions",
    //         quantity: 1.5,
    //         unit: "cups",
    //         preparationNotes: "finely chopped"
    //     }
    // },
    // {
    //     text: "1 medium-size shallot, peeled and finely diced", // TODO sentence split
    //     answer: {
    //         product: "red onions",
    //         quantity: 1.5,
    //         unit: "cups",
    //         preparationNotes: "finely chopped"
    //     }
    // },
    // {
    //     text: "1/2 teaspoon fresh thyme leaves, finely chopped", // TODO leaves not appending
    //     answer: {
    //         product: "fresh thyme leaves",
    //         quantity: 0.5,
    //         unit: "teaspoon",
    //         preparationNotes: "finely chopped"
    //     }
    // },
    // {
    //     text: "2-3 tablespoons butter", // TODO flatten to 2 by discarding until next
    //     answer: {
    //         product: "red onions",
    //         quantity: 1.5,
    //         unit: "cups",
    //         preparationNotes: "finely chopped"
    //     }
    // },
]

for (const test of tests) {
    it(`${test.text}`, () => {
        const tokens = new Tokenizer(test.text).tokenize()
        const ingredient = new Parser(tokens).parse()
        expect(ingredient).toMatchObject(test.answer)
    })
}
