
//var root = "http://172.19.3.156:8080/";
window.onload= function() {
    var doable = true;
    var new_stocks=[];
    var stocks;
    var url = "../gr?id="+getUrlParam("id");
    var success = function(data) {
        //console.log(data)
        $("#Title").html("<h1><center>"+ data.data.name+"</center></h1>");
        $("#instructions").html("<br><br><br><br><br><br><center>"+ data.data.instructions.replace(/\$n/g,"<br>")+"</center>");
        $.ajax({
            url: "../ior?id="+getUrlParam("id"),
            data: null,
            success: function(data){
                //console.log(data)
                var items = data.data.ingredients;
                //console.log(items)
                var table =  $("<table>").addClass("items_table");
                var header = $("<tr>").addClass("header");
                header.append($("<th>").text("Name"));
                header.append($("<th>").text("QTY"));
                header.append($("<th>").text("Unit"));
                table.append(header);
                items.forEach(function(it) {
                    var row = $("<tr>");
                    row.attr("ID",it.ingredient);
                    stocks.data.items.some(function(st){
                        if (st.id == it.ingredient){
                            new_stocks.push({id: st.id, stock: st.stock - it.amount})
                           if (st.stock >= it.amount){
                                row.css("background-color","#95e56e")
                           } else {
                                doable = false;
                                row.css("background-color","#ea8383");
                           }
                            return true;
                        }
                        return false;
                    });
                    var name = $("<td>").text(it.ingredient);
                    row.append(name);
                    var qty = $("<td>").text(it.amount);
                    row.append(qty);
                    var unit = $("<td>").text("amount");
                    row.append(unit);
                    table.append(row);
                    $.ajax({
                        url: "../gi?id="+it.ingredient,
                        data: null,
                        success: function(data){
                            setName(data,name,unit)
                        },
                        dataType:"json"
                    });
                });
                $("#Table").append(table);
            },
            dataType:"json"
        });
    }
    var askForData = function(){
        $.ajax({
            url: url,
            data: null,
            success: success,
            dataType: "json"
        });
    }
    $.ajax({
        url: "../s?name=",
        data: null,
        success: function(data){
            stocks = data;
            askForData();
        },
        dataType: "json"
    });
    $("#doRecipeButton").click(function(){
        if (doable){
            $.when(
                new_stocks.forEach(function(st){
                    $.ajax({
                        url: "../stock?id="+st.id+"&stock="+st.stock,
                        success:null,
                        data:"json"
                    });
               })
            ).done(function(){
                document.location.reload();
            });
        }
    });
}

// from stackoverflow https://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js
function getUrlParam(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function setName(data, name, unit){
    //console.log(data);
    name.text(data.data.name);
    unit.text(data.data.unit);
}
