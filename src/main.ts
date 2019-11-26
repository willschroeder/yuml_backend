import nlp = require('compromise')
import util = require('util')
import Debug from "debug"
import _ = require("lodash");

const debug = Debug("*")

const tests = [
    "1 1/2 cups finely chopped red onions",
    // "1 1/2 tsp red onions finely chopped",
    // "2 1/2 tablespoons finely chopped parsley",
    // "3 large Granny Smith apples",
    // "1 pound carrots, young ones if possible",
    // "Kosher salt, to taste",
    // "2 tablespoons sherry vinegar",
    // "2 tablespoons honey",
    // "2 tablespoons extra-virgin olive oil",
    // "1 medium-size shallot, peeled and finely diced",
    // "1/2 teaspoon fresh thyme leaves, finely chopped",
    // "Black pepper, to taste",
]

type Ingreident = {
    product: string
    quantity: number
    unit: string
    preparationNotes: string
}

// order matters
// constrain to https://www.clips.uantwerpen.be/pages/mbsp-tags
enum Tags {
    "Cardinal" = "Cardinal",
    "Noun" = "Noun",
    "Adverb" = "Adverb",
    "Verb" = "Verb",
    "Adjective" = "Adjective"
}

/*
  * [ { text: '1', tag: 'Cardinal' },
  *   { text: '1/2', tag: 'Cardinal' },
  *   { text: 'cups', tag: 'Noun' },
  *   { text: 'finely', tag: 'Adverb' },
  *   { text: 'chopped', tag: 'Verb' },
  *   { text: 'red', tag: 'Adjective' },
  *   { text: 'onions', tag: 'Noun' } ] +0ms
 */

interface IToken {
    text: string,
    tag: Tags
}

function stringToEnum<T>(enumObj: T, str: string | number): T {
    const key: T | undefined = (enumObj as any)[str]
    if (key !== undefined) {
        return key
    }
    throw `unable to convert ${str} to enum`
}

const parse = nlp(tests[0]).out('tags')
const zip = parse.map((i: {text: string, normal: string, tags: string[]}): IToken => {
    const tag = _.intersection(i.tags, Object.keys(Tags))[0]
    if (!tag) {
        throw `Unknown mapped token type in ${i.tags}`
    }
    // @ts-ignore
    return {text: i.normal, tag: stringToEnum(Tags, tag)}
}) as IToken[]

// debug(zip)

let tempAmount = 0
let tempUnit = ""
let tempPreparation = ""
let tempIngredient = ""

while (zip.length > 0) {
    const headTag = zip[0].tag

    if(headTag === Tags.Cardinal) {
        const {amount, unit} = parseAmount()
        tempAmount = amount
        tempUnit = unit
    }
    else if ([Tags.Adverb, Tags.Verb].includes(headTag)) {
        tempPreparation = parsePreparation()
    }
    else if ([Tags.Adjective, Tags.Noun].includes(headTag)) {
        tempIngredient = parseIngredient()
    }
    else {
        throw `Unknown tag type in ${headTag}`
    }
}

debug(tempAmount)
debug(tempUnit)
debug(tempPreparation)
debug(tempIngredient)

function parsePreparation(): string {
    let prep = []

    while (true) {
        if ([Tags.Adverb, Tags.Verb].includes(zip[0].tag)) {
            prep.push(zip[0].text)
            zip.shift()
        }
        else {
            break
        }
    }

    return prep.join(' ')
}

function parseAmount(): {amount: number, unit: string} {
    let amount = 0
    let unit = undefined

    while (zip[0]) {
        let token = zip[0]
        if (!token) {
            break
        }

        if (token.tag === Tags.Cardinal) {
            amount += eval(token.text)
            zip.shift()
        }
        else if (token.tag === Tags.Noun) {
            unit = token.text
            zip.shift()
            break
        }
    }

    if (amount <= 0) {
        throw "Amount cant be 0"
    }
    if (!unit) {
        throw "No unit found"
    }

    return {amount: amount, unit: unit}
}

function parseIngredient(): string {
    let ingredient = []

    while (zip[0]) {
        if ([Tags.Adjective, Tags.Noun].includes(zip[0].tag)) {
            ingredient.push(zip[0].text)
            zip.shift()
        }
        else {
            break
        }
    }

    return ingredient.join(' ')
}
