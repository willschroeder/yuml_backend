# yuml_backend

A backend that consumes recipe websites (only allrecipes.com at the moment) and converts them into a common document for portability.   
It also contains a parser that attempts to extract the ingreident, amount, and unit.   

*This is a prototype*

Examples

Parse a recipe from allrecipes.com
```
curl -X POST http://yuml-backend.herokuapp.com/v1/parse/?url=https://www.allrecipes.com/recipe/220943/chef-johns-buttermilk-biscuits/ | jq
```

Fetch a recipe
```
curl http://yuml-backend.herokuapp.com/v1/recipe/93be94d1-250c-4ed8-94e8-c31fe72a29f8 | jq
```
