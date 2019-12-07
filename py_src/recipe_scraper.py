# https://www.digitalocean.com/community/tutorials/how-to-scrape-web-pages-with-beautiful-soup-and-python-3
# https://nycdatascience.com/blog/student-works/recipes-scraping-top-20-recipes-allrecipes/
# https://github.com/cookbrite/Recipe-to-Markdown
# https://github.com/kadnan/Python-Elasticsearch/blob/master/fetch_recipes.py

import json
import sys
import requests
from bs4 import BeautifulSoup

def all_recipes(url):
    page = requests.get(url)
    soup = BeautifulSoup(page.text, "html.parser")

    ingredients = []

    for item in soup.find_all("span", {"class": "recipe-ingred_txt added"}):
        ingredients.append(item.text.strip())

    steps = []
    for step in soup.find_all("span", {"class": "recipe-directions__list--item"}):
        steps.append(step.text.strip())

    return {"ingredients": ingredients, "steps": steps}

# print(all_recipes('https://www.allrecipes.com/recipe/220943/chef-johns-buttermilk-biscuits/'))

args = sys.argv[1:]
site = args[0]
site_url = args[1]

if not site or not site_url:
    print(json.dumps({"error": "Need a website and a url as params"}))
    exit(1)

if site == "allrecipes":
    print(json.dumps(all_recipes(site_url)))

exit(0)