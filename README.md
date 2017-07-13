# HSM.js
Home Stock Manager JavaScript version

Small web-based app to manage house stock, recipes and shopping lists.

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
