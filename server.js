var exp = require("express")
var app = exp();
var sql = require("sqlite3")
var favicon = require("serve-favicon")
var path = require("path");
var db = new sql.Database('hsm.db');

var create_table = "create table if not exists ITEMS ("+
    "ID integer primary key autoincrement,"+
    "NAME text unique,"+
    "STOCK float,"+
    "MIN_STOCK float,"+
    "MAX_STOCK float,"+
    "UNIT text);";

db.run(create_table,[],function(error){ if (error) console.log(error);});

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

//app.use(exp.static());
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
    newItem(item,res);
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


console.log("Listening on port 8080..")
app.listen(8080);
