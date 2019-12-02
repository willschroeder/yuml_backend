import execa = require('execa');
import {PythonRepo} from "./repo/python"

(async () => {
    try {
        const ingredients = ["1 cup parsley", "1 tsp basil"]
        const repo = new PythonRepo()
        const sentences = await repo.tokenize(ingredients)
        console.log(sentences[0][0])
    }
    catch (e) {
        console.log(e)
    }
})();
