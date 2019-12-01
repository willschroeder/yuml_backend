import execa = require('execa');

(async () => {
    try {
        const {stdout} = await execa('python3', ['./py_src/sentence_tokenizer.py', "1 cup parsley", "1 tsp basil"])
        console.log(stdout);
    }
    catch (e) {
        console.log(e)
    }
})();
