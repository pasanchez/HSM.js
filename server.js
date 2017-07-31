var exp = require("express")
var app = exp();
var sql = require("sqlite3")
var favicon = require("serve-favicon")
var path = require("path");
var basicAuth = require('express-basic-auth');
var fs = require("fs");
var db = new sql.Database('hsm.db');
var configFile = ".config.json";

var config;
if (fs.existsSync(configFile)) {
    config = JSON.parse(fs.readFileSync(configFile,'utf8'));
}else{
    config = {user: "user", password: "123456" };
    fs.writeFile(configFile,JSON.stringify(config),'utf8');
}


var create_table_item = "create table if not exists ITEMS ("+
    "ID integer primary key autoincrement,"+
    "NAME text unique,"+
    "STOCK float,"+
    "MIN_STOCK float,"+
    "MAX_STOCK float,"+
    "UNIT text,"+
    "TYPE text);";

var create_table_recipe = "create table if not exists RECIPES ("+
    "ID integer primary key autoincrement,"+
    "NAME text unique,"+
    "INSTRUCTIONS text);";

var create_recipe_ingredient = "create table if not exists RECIPES_INGREDIENTS_IT("+
    "RECIPE_ID integer,"+
    "AMOUNT float," +
    "ITEM_ID integer,"+
    "unique(RECIPE_ID, ITEM_ID)"+
    " on conflict replace);";

db.run(create_table_item,[],function(error){ if (error) console.log(error);});
db.run(create_table_recipe,[],function(error){ if (error) console.log(error);});
db.run(create_recipe_ingredient,[],function(error){ if (error) console.log(error);});

function compareStrings(a, b){
    a = a.toLowerCase();
    b = b.toLowerCase();
    return (a<b)? -1: (a>b)?1:0;
}

function newItem(item, res) {
    var new_item = "insert into ITEMS (NAME, STOCK, MIN_STOCK, MAX_STOCK,UNIT) " +
        "values ($name,$stock,$min_stock,$max_stock,$unit);";
    db.run(new_item, item,function(error){ if (error){
        if ( error.code != "SQLITE_CONSTRAINT") res.send({code: -1, msg: error.code, data: error});
    }else {
        getItem(this.lastID,res,{code: 0, msg: null, data: null});
    }});
}

function newRecipe(recipe, res) {
    var new_recipe = "insert into RECIPES (NAME, INSTRUCTIONS) " +
        "values ($name,$instructions);";
    db.run(new_recipe, recipe,function(error){ if (error){
        if ( error.code != "SQLITE_CONSTRAINT"){
            res.send({code: -1, msg: error.code, data: error});
        }else{
            res.send({code: 0, msg: null});
        }
    }else {
        getRecipe(this.lastID,res,{code: 0, msg: null, data: null});
    }});
}

function newRecipeIngredient(ingredient, res) {
    var new_recipe_ingredient = "insert into RECIPES_INGREDIENTS_IT(RECIPE_ID, AMOUNT, ITEM_ID) " +
        "values ($recipe,$amount,$item);";
    db.run(new_recipe_ingredient, ingredient,function(error){ if (error){
        res.send({code: -1, msg: error.code, data: error});
    }else {
        getRecipe(this.lastID,res,{code: 0, msg: null, data: null});
    }});
}

function searchItem(name, res) {
    name = "%" + name + "%";
    var results = {data: {items: []}}
    var search_item = "select * from ITEMS where upper(NAME) like  upper($name) ;";
    db.each(search_item, {$name:name}, function(error, row) {
        if (error){
            res.send({code: -1, msg: error.code, data: error})
        }else {
            results.data.items.push({
                id : row.ID,
                name : row.NAME,
                stock: row.STOCK,
                min_stock : row.MIN_STOCK,
                max_stock : row.MAX_STOCK,
                unit: row.UNIT
            });
        }
    }, function(err,size) {
        results.data.items.sort(function(a,b){
            return compareStrings(a.name,b.name);
        });
        results["code"] =0;
        results["msg"] = null;
        results.data["size"] = size;
        res.send(results);
    });
}
function getIngredientsOfRecipe(ID,res){
    var search_item = "select * from RECIPES_INGREDIENTS_IT where RECIPE_ID = $ID;";
    var array = [];
    db.each(search_item, {$ID:ID}, function(error, row) {
        if (error){
            res.send({code: -1, msg: error.code, data: error})
        }else {
            array.push({
                amount: row.AMOUNT,
                ingredient: row.ITEM_ID
            });
        }
    }, function(err,size) {
        if (err){
            res.send({code: -1, msg: err.code, data: err})
        }else{
           res.send({code: 0, msg: null, data: {ingredients: array}});
        }
    });
}

function searchRecipe(name, res) {
    name = "%" + name + "%";
    var results = {data: {items: []}}
    var search_item = "select * from RECIPES where upper(NAME) like  upper($name) ;";
    db.each(search_item, {$name:name}, function(error, row) {
        if (error){
            res.send({code: -1, msg: error.code, data: error})
        }else {
            results.data.items.push({
                id : row.ID,
                name : row.NAME,
                instructions: row.INSTRUCTIONS,
            });
        }
    }, function(err,size) {
        results.data.items.sort(function(a,b){
            return compareStrings(a.name,b.name);
        });
        results["code"] =0;
        results["msg"] = null;
        results.data["size"] = size;
        res.send(results);
    });
}

function getItem(ID,res, json) {
    var results = {};
    var get = "select * from ITEMS where ID = $ID;";
    db.each(get, {$ID:ID}, function(error, row) {
        if (error){
             var errormsg = {code: -1, msg: error.code, data: error}
            if (json) {
                json.data = errormsg;
                res.send(json);
            }else {
               res.send(errormsg);
            }
        }else {
            results["data"] = {
                id : row.ID,
                name : row.NAME,
                stock: row.STOCK,
                min_stock : row.MIN_STOCK,
                max_stock : row.MAX_STOCK,
                unit: row.UNIT
            };
        }
    }, function(err,size) {
        results["code"] =0;
        results["msg"] = null;
        res.send(results);
    });
}


function getRecipe(ID,res, json) {
    var results = {};
    var get = "select * from RECIPES where ID = $ID;";
    db.each(get, {$ID:ID}, function(error, row) {
        if (error){
             var errormsg = {code: -1, msg: error.code, data: error}
            if (json) {
                json.data = errormsg;
                res.send(json);
            }else {
               res.send(errormsg);
            }
        }else {
            results["data"] = {
                id : row.ID,
                name : row.NAME,
                instructions: row.INSTRUCTIONS,
            };
        }
    }, function(err,size) {
        results["code"] =0;
        results["msg"] = null;
        res.send(results);
    });
}

function getItemLocal(ID) {
    var results = {};
    var get = "select * from ITEMS where ID = $ID;";
    db.each(get, {$ID:ID}, function(error, row) {
        if (error){
             var errormsg = {code: -1, msg: error.code, data: error}
            if (json) {
                json.data = errormsg;
                res.send(json);
            }else {
               res.send(errormsg);
            }
        }else {
            results = {
                id : row.ID,
                name : row.NAME,
                stock: row.STOCK,
                min_stock : row.MIN_STOCK,
                max_stock : row.MAX_STOCK,
                unit: row.UNIT
            };
        }
    }, function(err,size) {
        return results;
    });
}
function getShoppingList(res){
    var sl = "select * from ITEMS where STOCK < MIN_STOCK;";
    data_ = []
    db.each(sl,[],function(err,row){
        if (err) {
           res.send({code: -1,msg:err.code, data:err});
        }else{
            data_.push({name: row.NAME, qty: row.MAX_STOCK-row.STOCK, id:row.ID, stock:row.STOCK})
        }
    },function(err,size_){
        data_.sort(function(a,b){
           return compareStrings(a.name,b.name); 
        });
        res.send({code:0, msg:null, data: {size: size_, items: data_ }});
    });
}

function deleteItem(ID,res){
    var deleteItem = "delete from ITEMS where ID = $ID;";
    db.run(deleteItem,{$ID:ID},function(err){
        if (err){
            res.send({code: -1, msg: err.code, data: err});
        }else{
            res.send({code: 0, msg:null, data:null});
        }
    });
}

function deleteRecipe(ID,res){
    var error = false;
    var deleteRecipe = "delete from RECIPES where ID = $ID;";
    var deleteIngredients = "delete from RECIPES_INGREDIENTS_IT where RECIPE_ID = $ID;";
    db.run(deleteRecipe,{$ID:ID},function(err){
        if (err){
            res.send({code: -1, msg: err.code, data: err});
        }else{
            db.run(deleteIngredients,{$ID:ID},function(err){
                if (err){
                    res.send({code: -1, msg: err.code, data: err});
                }else{
                    res.send({code: 0, msg:null, data:null});
                }
            });
        }
    });
}

function updateStock(stock,id,res) {
    var update = "update ITEMS set STOCK = $stock where ID = $ID;";
    db.run(update,{$stock:stock, $ID:id}, function(err){
        if (err){
            res.send({code: -1, msg: err.code, data: err});
        }else{
            getItem(id,res,{code: 0, msg: null, data: null});
        }
    });
}

function getNotDoableRecipes(res){
    var sl = "select RECIPES_INGREDIENTS_IT.RECIPE_ID from RECIPES_INGREDIENTS_IT join ITEMS "+
        "on ITEMS.ID = RECIPES_INGREDIENTS_IT.ITEM_ID  where ITEMS.STOCK < RECIPES_INGREDIENTS_IT.AMOUNT;";
    data_ = [];
    db.each(sl,[],function(err,row){
        if (err) {
           res.send({code: -1,msg:err.code, data:err});
        }else{
            if(data_.indexOf(row.RECIPE_ID) == -1) data_.push(row.RECIPE_ID);
        }
    },function(err,size_){
        res.send({code:0, msg:null, data: {size: size_, items: data_ }});
    });
}

var users_ = {};
users_[config.user] = config.password;
app.use(basicAuth({
    users: users_,
    challenge: true
}));
app.use(favicon("static/resources/favicon.ico"));

app.use("/",exp.static(path.join(__dirname, 'static')));

app.get("/n", function(req,res){
    var item = {
        $name: req.query.name,
        $stock: req.query.stock,
        $min_stock: req.query.min,
        $max_stock: req.query.max,
        $unit: req.query.unit
    }
    console.log("New Item", item);
    +newItem(item,res);
});

app.get("/s", function(req,res){
    console.log("Search item name " + req.query.name);
    searchItem(req.query.name,res);
});

app.get("/g", function(req,res){
    console.log("Get item" + req.query.id);
    getItem(req.query.id,res);
});

app.get("/list", function(req,res){
    console.log("Get shopping list");
    getShoppingList(res);
});

app.get("/d",function(req,res){
    console.log("Delete item " + req.query.id);
    deleteItem(req.query.id,res)
});

app.get("/stock",function(req,res){
    console.log("Changing stock of " + req.query.id + " to " + req.query.stock);
    updateStock(req.query.stock,req.query.id,res);
});

app.get("/nr", function(req,res){
    console.log("New Recipe " + req.query.name);
    newRecipe({$name: req.query.name, $instructions: req.query.ins},res);
});

app.get("/ni", function(req,res){
    console.log("New Ingredient for recipe" + req.query.rid);
    newRecipeIngredient({$recipe: req.query.rid, $amount: req.query.amount, $item: req.query.iid},res);
});

app.get("/sr",function(req,res){
    console.log("Search for recipe " + req.query.name);
    searchRecipe(req.query.name,res);
});

app.get("/dr",function(req,res){
    console.log("Delete recipe " + req.query.id);
    deleteRecipe(req.query.id,res)
});

app.get("/ior",function(req,res){
    console.log("Ingredients of recipe" + req.query.id);
    getIngredientsOfRecipe(req.query.id,res);
});

app.get("/recipes",function(req,res){
    console.log("Listing recipes not doables");
    getNotDoableRecipes(res);
});

app.get("/gr",function(req,res){
    console.log("Getting recipe by ID");
    getRecipe(req.query.id,res);
});

app.get("/gi",function(req,res){
    console.log("Getting Item by ID");
    getItem(req.query.id,res);
});

console.log("Listening on port 8080..")
app.listen(8080);
