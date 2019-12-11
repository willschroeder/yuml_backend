import Debug from "debug"
import _ = require("lodash")
import nlp = require('compromise')

const debug = Debug("*")

// order matters
// constrain to https://www.clips.uantwerpen.be/pages/mbsp-tags
enum Tags {
    Cardinal = "Cardinal",
    Noun = "Noun",
    Adverb = "Adverb",
    Verb = "Verb",
    Adjective = "Adjective",
    Conjunction = "Conjunction",
    Comma = "Comma"
}

const WordTags = [Tags.Cardinal, Tags.Noun, Tags.Adverb, Tags.Verb, Tags.Adjective, Tags.Conjunction]

function stringToEnum<T>(enumObj: T, str: string | number): T {
    const key: T | undefined = (enumObj as any)[str]
    if (key !== undefined) {
        return key
    }
    throw `unable to convert ${str} to enum`
}

type Token = {
    text: string,
    tag: Tags
}


export class Tokenizer {
    constructor(private str: string) {

    }

    public tokenize(): Token[] {
        const parse = nlp(this.str).out('tags')
        const tokens: Token[] = []
        parse.forEach((i: { text: string, normal: string, tags: string[] }) => {
            // Make Condition a Conjunction, example: "if"
            if (i.tags.includes("Condition")) {
                tokens.push({text: i.normal, tag: Tags.Conjunction})
            } else {
                const tag = _.intersection(i.tags, WordTags)[0]
                if (!tag) {

                    debug(`Unknown mapped token type in ${i.tags}`)
                    throw `Unknown mapped token type in ${i.tags}`
                }
                // @ts-ignore
                tokens.push({text: i.normal, tag: stringToEnum(Tags, tag)})
            }

            if (i.tags.includes("Comma")) {
                tokens.push({text: ',', tag: Tags.Comma})
            }
        })

        return tokens
    }
}

export type IngredientParse = {
    product?: string
    quantity?: number
    unit?: string
    preparationNotes?: string
}

export class Parser {
    constructor(private tokens: Token[]) {
    }

    public parse(): IngredientParse {
        const ingredient: IngredientParse = {}

        // console.log(this.tokens)

        while (this.tokens.length > 0) {
            const headTag = this.tokens[0].tag
            if (!headTag) {
                break
            }

            const productIdentified = ingredient.product !== undefined

            if (headTag === Tags.Cardinal) {
                const {quantity, unit} = this.parseQuantity()
                ingredient.quantity = quantity
                ingredient.unit = unit
            } else if (!productIdentified && [Tags.Adjective, Tags.Noun].includes(headTag)) {
                ingredient.product = this.parseProduct()
            } else if (headTag === Tags.Comma) {
                this.tokens.shift()
            } else {
                const prep = this.parsePreparation(productIdentified)
                if (!ingredient.preparationNotes) {
                    ingredient.preparationNotes = prep
                } else {
                    ingredient.preparationNotes += `, ${prep}`
                }
            }
        }

        if (!ingredient.product) {
            debug(ingredient)
            throw `No ingredient product parsed`
        }

        return ingredient
    }

    private parsePreparation(consumeNouns: boolean): string {
        let prep = []

        while (this.tokens[0]) {
            if ([Tags.Adjective, Tags.Noun].includes(this.tokens[0].tag)) {
                if (consumeNouns) {
                    prep.push(this.tokens[0].text)
                    this.tokens.shift()
                } else {
                    break
                }
            } else {
                prep.push(this.tokens[0].text)
                this.tokens.shift()
            }
        }

        return prep.join(' ')
    }

    private parseQuantity(): { quantity: number, unit?: string } {
        let quantity = 0
        let unit = undefined

        while (this.tokens[0]) {
            let token = this.tokens[0]
            if (!token) {
                break
            }

            if (token.tag === Tags.Cardinal) {
                quantity += eval(token.text)
                this.tokens.shift()
            } else if (token.tag === Tags.Noun) {
                unit = token.text
                this.tokens.shift()
                break
            } else {
                break
            }
        }

        if (quantity <= 0) {
            throw "Amount cant be 0"
        }

        return {quantity: quantity, unit: unit}
    }

    private parseProduct(): string {
        let ingredient = []

        while (this.tokens[0]) {
            if ([Tags.Adjective, Tags.Noun].includes(this.tokens[0].tag)) {
                ingredient.push(this.tokens[0].text)
                this.tokens.shift()
            } else {
                break
            }
        }

        return ingredient.join(' ')
    }
}
