import Debug from "debug"
import {PythonRepo} from "../repo/python"

const debug = Debug("*")

enum Tags {
    Cardinal = "Cardinal",
    Noun = "Noun",
    Adverb = "Adverb",
    Verb = "Verb",
    Adjective = "Adjective",
    Conjunction = "Conjunction",
    Infinitival = "Infinitival",
    Comma = "Comma"
}

type Token = {
    text: string,
    tag: Tags
}

export class Tokenizer {
    private readonly str: string
    private readonly wordsWithCommas: boolean[]

    constructor(str: string) {
        this.str = str.toLowerCase()
        this.str = this.str.replace("-", " ")
        this.wordsWithCommas = str.split(" ").map((i) => { return i.slice(-1) === ',' })
    }

    public async tokenize(): Promise<Token[]> {
        const tags = (await (new PythonRepo()).tokenize([this.str]))[0]
        const tokens: Token[] = []

        tags.forEach((i: {text: string, tag: string}) => {
            tokens.push({text: i.text, tag: this.codeToTag(i.tag)})
        })

        this.wordsWithCommas.forEach((value: boolean, i: number) => {
            if (value) {
                tokens.splice(i+1, 0, {text: ',', tag: Tags.Comma})
            }
        })

        return tokens
    }

    private codeToTag(code: string): Tags {
        // https://www.clips.uantwerpen.be/pages/mbsp-tags
        switch(code.substring(0,2)) {
            case "CD":
                return Tags.Cardinal
            case "NN":
                return Tags.Noun
            case "RB":
                return Tags.Adverb
            case "VB":
                return Tags.Verb
            case "JJ":
                return Tags.Adjective
            case "CC":
            case "IN":
                return Tags.Conjunction
            case "TO":
                return Tags.Infinitival
            default:
                debug(`Unknown tag type ${code}`)
                throw `Unknown tag type ${code}`
        }
    }
}

export type Ingredient = {
    product?: string
    quantity?: number
    unit?: string
    preparationNotes?: string
}

export class Parser {
    constructor(private tokens: Token[]) {
    }

    public parse(): Ingredient {
        const ingredient: Ingredient = {
        }

        // console.log(this.tokens)

        while (this.tokens.length > 0) {
            const headTag = this.tokens[0].tag
            if (!headTag) {
                break
            }

            const productIdentified = ingredient.product !== undefined

            if(headTag === Tags.Cardinal) {
                const {quantity, unit} = this.parseQuantity()
                ingredient.quantity = quantity
                ingredient.unit = unit
            }
            else if (!productIdentified && [Tags.Adjective, Tags.Noun].includes(headTag)) {
                ingredient.product = this.parseProduct()
            }
            else if (headTag === Tags.Comma) {
                this.tokens.shift()
            }
            else {
                const prep = this.parsePreparation(productIdentified)
                if (!ingredient.preparationNotes) {
                    ingredient.preparationNotes = prep
                }
                else {
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
                }
                else {
                    break
                }
            }
            else {
                prep.push(this.tokens[0].text)
                this.tokens.shift()
            }
        }

        return prep.join(' ')
    }

    private parseQuantity(): {quantity: number, unit?: string} {
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
            }
            else if (token.tag === Tags.Noun) {
                unit = token.text
                this.tokens.shift()
                break
            }
            else {
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
            }
            else {
                break
            }
        }

        return ingredient.join(' ')
    }
}
