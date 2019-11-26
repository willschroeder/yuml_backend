import nlp = require('compromise')
import Debug from "debug"
import _ = require("lodash");

const debug = Debug("*")

const tests = [
    "1 1/2 cups finely chopped red onions",
    // "1 1/2 tsp red onions finely chopped",
    // "2 1/2 tablespoons finely chopped parsley",
    // "3 large Granny Smith apples", // TODO large is a size modifier
    // "1 pound carrots, young ones if possible", // TODO needs to split carrots off after noun, dont let values be re-set.
    /*
        1 pound finely chopped carrots, young ones if possible

        IDEAL
        1 pound carrots, finely chopped, young ones if possible

        is the first noun grouping (that isnt a unit)  assumed to be the ingredient?
        maybe everything after the first comma/sentence break is descriptions
     */
    // "Kosher salt, to taste",
    // "2 tablespoons sherry vinegar",
    // "2 tablespoons honey",
    // "2 tablespoons extra-virgin olive oil",
    // "1 medium-size shallot, peeled and finely diced", // TODO sentence split
    // "1/2 teaspoon fresh thyme leaves, finely chopped",
    // "2-3 tablespoons butter" // TODO unsure what to do with dash, zestful flatten to smallest number
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
    Cardinal = "Cardinal",
    Noun = "Noun",
    Adverb = "Adverb",
    Verb = "Verb",
    Adjective = "Adjective",
    Conjunction = "Conjunction"
}

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
debug(parse)
// debug(nlp(tests[0]).sentences().out())

const zip = parse.map((i: {text: string, normal: string, tags: string[]}): IToken => {
    // Make Condition a Conjunction, example: "if"
    if (i.tags.includes("Condition")) {
        return {text: i.normal, tag: Tags.Conjunction}
    }

    const tag = _.intersection(i.tags, Object.keys(Tags))[0]
    if (!tag) {

        debug(`Unknown mapped token type in ${i.tags}`)
        throw `Unknown mapped token type in ${i.tags}`
    }
    // @ts-ignore
    return {text: i.normal, tag: stringToEnum(Tags, tag)}
}) as IToken[]

debug(zip)

try {
    let tempAmount: number|undefined
    let tempUnit: string|undefined
    let tempPreparation: string|undefined
    let tempIngredient: string|undefined

    while (zip.length > 0) {
        const headTag = zip[0].tag

        if(headTag === Tags.Cardinal) {
            const {amount, unit} = parseAmount()
            tempAmount = amount
            tempUnit = unit
        }
        else if (!tempIngredient && [Tags.Adjective, Tags.Noun].includes(headTag)) {
            tempIngredient = parseIngredient()
        }
        else if ([Tags.Adverb, Tags.Verb, Tags.Conjunction].includes(headTag)) {
            tempPreparation = parsePreparation()
        }
        else {
            throw `Unable to start with a tag ${headTag}`
        }
    }

    debug(tempAmount)
    debug(tempUnit)
    debug(tempIngredient)
    debug(tempPreparation)
}
catch (e) {
    debug(e)
}

function parsePreparation(): string {
    let prep = []

    while (zip[0]) {
        if ([Tags.Adverb, Tags.Verb, Tags.Conjunction].includes(zip[0].tag)) {
            prep.push(zip[0].text)
            zip.shift()
        }
        else {
            break
        }
    }

    return prep.join(' ')
}

function parseAmount(): {amount: number, unit?: string} {
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
        else {
            break
        }
    }

    if (amount <= 0) {
        throw "Amount cant be 0"
    }

    return {amount: amount, unit: unit}
}

function parseIngredient(): string {
    let ingredient = []
    let nounSet = false // nouns should be the last thing in an ingredient

    while (zip[0]) {
        if ([Tags.Adjective].includes(zip[0].tag)) {
            if (nounSet) {
                break
            }

            ingredient.push(zip[0].text)
            zip.shift()
        }
        if ([Tags.Adjective, Tags.Noun].includes(zip[0].tag)) {
            ingredient.push(zip[0].text)
            zip.shift()
            nounSet = true
        }
        else {
            break
        }
    }

    return ingredient.join(' ')
}
