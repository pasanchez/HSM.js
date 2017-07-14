# HSM.js
Home Stock Manager JavaScript version

Small web-based app to manage house stock, recipes and shopping lists.

User and Password must be changed in the file .config.json that will be created.

## REST API:

* n:
  * Create new Item
  * params: name stock min max unit
* s:
  * Search by name in DB
  * params: name 
* list:
  * Outputs shopping list
* d:
  * Delete item by ID in DB
  * params: ID 
* stock:
  * Change item stock by ID in DB
  * params: ID stock
* nr:
  * New Recipe
  * params: name instructions
* ni:
  * New Ingredient in Recipe. Must be in items db.
  * params: rid (recipe ID) amount iid (item id)
* sr:
  * Search recipe by name
  * params: name
* dr:
  * Delete recipe by ID
  * params: ID
* ior:
  * List of ingredients of a recipe.
  * params: ID
* recipes:
  * List of recipes NOT doables with current stock.
