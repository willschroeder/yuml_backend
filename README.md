# yuml_backend

*This is a prototype*

A backend that consumes recipe websites (only allrecipes.com at the moment) and converts them into a common document for portability.   

It also contains a parser that attempts to extract the ingreident, amount, and unit.   
https://github.com/willschroeder/yuml_backend/tree/master/src/parser

Examples

Parse a recipe from allrecipes.com
```
curl -X POST http://yuml-backend.herokuapp.com/v1/parse/?url=https://www.allrecipes.com/recipe/220943/chef-johns-buttermilk-biscuits/ | jq
```

```json
{
  "uuid": "0cae4fee-99fd-41b0-8ea7-c4317ef8eabd"
}
```

Fetch a recipe
```
curl http://yuml-backend.herokuapp.com/v1/recipe/0cae4fee-99fd-41b0-8ea7-c4317ef8eabd | jq
```

```json
{
  "uuid": "0cae4fee-99fd-41b0-8ea7-c4317ef8eabd",
  "url": "https://www.allrecipes.com/recipe/220943/chef-johns-buttermilk-biscuits/",
  "recipe": {
    "uuid": "0cae4fee-99fd-41b0-8ea7-c4317ef8eabd",
    "steps": [
      "Preheat oven to 425 degrees F (220 degrees C).",
      "Line a baking sheet with a silicone baking mat or parchment paper.",
      "Whisk flour, baking powder, salt, and baking soda together in a large bowl.",
      "Cut butter into flour mixture with a pastry blender until the mixture resembles coarse crumbs, about 5 minutes.",
      "Make a well in the center of butter and flour mixture. Pour in 3/4 cup buttermilk; stir until just combined.",
      "Turn dough onto a floured work surface, pat together into a rectangle.",
      "Fold the rectangle in thirds. Turn dough a half turn, gather any crumbs, and flatten back into a rectangle. Repeat twice more, folding and pressing dough a total of three times.",
      "Roll dough on a floured surface to about 1/2 inch thick.",
      "Cut out 12 biscuits using a 2 1/2-inch round biscuit cutter.",
      "Transfer biscuits to the prepared baking sheet. Press an indent into the top of each biscuit with your thumb.",
      "Brush the tops of biscuits with 2 tablespoons buttermilk.",
      "Bake in the preheated oven until browned, about 15 minutes."
    ],
    "ingredients": [
      {
        "text": "2 cups all-purpose flour",
        "analysis": {
          "unit": "cups",
          "product": "all purpose flour",
          "quantity": 2
        }
      },
      {
        "text": "2 teaspoons baking powder",
        "analysis": {
          "unit": "teaspoons",
          "product": "powder",
          "quantity": 2,
          "preparationNotes": "baking"
        }
      },
      {
        "text": "1 teaspoon salt",
        "analysis": {
          "unit": "teaspoon",
          "product": "salt",
          "quantity": 1
        }
      },
      {
        "text": "1/4 teaspoon baking soda",
        "analysis": {
          "unit": "teaspoon",
          "product": "soda",
          "quantity": 0.25,
          "preparationNotes": "baking"
        }
      },
      {
        "text": "7 tablespoons unsalted butter, chilled in freezer and cut into thin slices",
        "analysis": {}
      },
      {
        "text": "3/4 cup cold buttermilk",
        "analysis": {
          "unit": "cup",
          "product": "cold buttermilk",
          "quantity": 0.75
        }
      },
      {
        "text": "2 tablespoons buttermilk for brushing",
        "analysis": {}
      }
    ]
  }
}
```
