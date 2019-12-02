import execa from "execa"

export class PythonRepo {
    public async tokenize(strs: string[]): Promise<PythonRepoSentence[]> {
        const {stdout} = await execa('python3', ['./py_src/sentence_tokenizer.py'].concat(strs))
        const sentences = JSON.parse(stdout)
        return sentences.map ((sentence: any[]) => {
            return sentence.map((i: string[]) => {
                return {
                    text: i[0],
                    tag: i[1]
                }
            })
        })
    }
}

export type PythonRepoSentence = {text: string, tag: string}[]
