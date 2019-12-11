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
        text = step.text.strip()
        if len(text) > 0:
            steps.append(text)

    return {"ingredients": ingredients, "steps": steps}

print("{\"ingredients\":[\"2 cups all-purpose flour\",\"2 teaspoons baking powder\",\"1 teaspoon salt\",\"1/4 teaspoon baking soda\",\"7 tablespoons unsalted butter, chilled in freezer and cut into thin slices\",\"3/4 cup cold buttermilk\",\"2 tablespoons buttermilk for brushing\"],\"steps\":[\"Preheat oven to 425 degrees F (220 degrees C).\",\"Line a baking sheet with a silicone baking mat or parchment paper.\",\"Whisk flour, baking powder, salt, and baking soda together in a large bowl.\",\"Cut butter into flour mixture with a pastry blender until the mixture resembles coarse crumbs, about 5 minutes.\",\"Make a well in the center of butter and flour mixture. Pour in 3/4 cup buttermilk; stir until just combined.\",\"Turn dough onto a floured work surface, pat together into a rectangle.\",\"Fold the rectangle in thirds. Turn dough a half turn, gather any crumbs, and flatten back into a rectangle. Repeat twice more, folding and pressing dough a total of three times.\",\"Roll dough on a floured surface to about 1/2 inch thick.\",\"Cut out 12 biscuits using a 2 1/2-inch round biscuit cutter.\",\"Transfer biscuits to the prepared baking sheet. Press an indent into the top of each biscuit with your thumb.\",\"Brush the tops of biscuits with 2 tablespoons buttermilk.\",\"Bake in the preheated oven until browned, about 15 minutes.\"]}")

# print(all_recipes('https://www.allrecipes.com/recipe/220943/chef-johns-buttermilk-biscuits/'))

# args = sys.argv[1:]
# site = args[0]
# site_url = args[1]
#
# if not site or not site_url:
#     print(json.dumps({"error": "Need a website and a url as params"}))
#     exit(1)
#
# if site == "allrecipes":
#     print(json.dumps(all_recipes(site_url)))
#
# exit(0)
