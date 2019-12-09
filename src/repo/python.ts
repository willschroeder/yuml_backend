import execa from "execa"

export class PythonRepo {
    public async sentenceTokenize(sentence: string[]): Promise<PythonRepoSentence[]> {
        const {stdout} = await execa('python3', ['./py_src/sentence_tokenizer.py'].concat(sentence))
        const sentences = JSON.parse(stdout)
        return sentences.map((sentence: any[]) => {
            return sentence.map((i: string[]) => {
                return {
                    text: i[0],
                    tag: i[1]
                }
            })
        })
    }

    public async scrapeRecipe(site: RecipeWebsites, url: string): Promise<ScrapedRecipe> {
        const {stdout} = await execa('python3', ['./py_src/recipe_scraper.py', site, url])
        return JSON.parse(stdout)
    }
}

export type PythonRepoSentence = { text: string, tag: string }[]
export type ScrapedRecipe = {
    ingredients: string[]
    steps: string[]
}

enum RecipeWebsites {
    AllRecipes = "allrecipes"
}
