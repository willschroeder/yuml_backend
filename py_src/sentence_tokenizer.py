import sys
import json
from textblob import TextBlob

sentences = sys.argv[1:]
tags = []

for sentence in sentences:
    blob = TextBlob(sentence)
    tags.append(blob.tags)

print(json.dumps(tags))