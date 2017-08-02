var root = "";
window.onload= function() {
    var url = "../s?name=";
    var success = function(data) {
        var items = data.data.items;
        var table =  $("<table>").addClass("items_table");
        table.css("display","inline");
        var header = $("<tr>").addClass("header");
        header.append($("<th>").text("Name"));
        header.append($("<th>").text("Amount"));
        header.append($("<th>").text("Unit"));
        table.append(header);
        items.forEach(function(it) {
            var row = $("<tr>");
            row.attr("ID",it.id);
            var name = $("<td>").text(it.name);
            row.append(name);
            var amount = $("<td>");
            var input = $("<input>");
            input.attr("type","number");
            amount.append(input);
            row.append(amount);
            var unit = $("<td>").text(it.unit);
            row.append(unit);
            table.append(row);
        });
        $(".ingredient_add").append(table)
        var table_new =  $("<table>").addClass("ingredients_table");
        table_new.css("display","inline");
        var header = $("<tr>").addClass("header");
        header.append($("<th>").text("Name"));
        header.append($("<th>").text("Amount"));
        header.append($("<th>").text("Unit"));
        table_new.append(header);
        $(".ingredient_add").append(table_new)
        $(".items_table tr").click(function(){
            var ID = $(this).attr("ID");
            var name = $(this).find('td:eq(0)').html();
            var unit = $(this).find('td:eq(2)').html();
            var amount = $(this).find('input').val();
            if (amount != "" && amount != "0"){
                var row = $("<tr>");
                row.attr("ID",ID);
                var name = $("<td>").text(name);
                row.append(name);
                var amount = $("<td>").text(amount);
                row.append(amount);
                var unit = $("<td>").text(unit);
                row.append(unit);
                row.click(function(){
                    $(this).remove();
                });
               $(".ingredients_table").append(row);
            }
        });
        $('.items_table tr input').click(function(e) {
            e.stopPropagation();
        });
    }
    $.ajax({
        url: url,
        data: null,
        success: success,
        dataType: "json"
    });
}

function filterTable(){
    var input = $("#search_recipe");
    var name = input.val().toUpperCase();
    $(".items_table > tbody > tr:not(:has(th))").each(function(){
        var item_name = $(this).children("td").first();
        if (item_name.html().toUpperCase().includes(name) || name == "") {
            $(this).show();
        }else{
            $(this).hide();
        }
    })

    $(".ingredients_table > tbody > tr:not(:has(th))").each(function(){
        var item_name = $(this).children("td").first();
        if (item_name.html().toUpperCase().includes(name) || name == "") {
            $(this).show();
        }else{
            $(this).hide();
        }
    })
}

var count = 0;
function saveRecipe() {
    var name = $("#name").val();
    var inst = $("#instructions").val();
    inst = inst.replace(/\n/g,"$n");
    var url = "../nr?name="+name+"&ins="+inst;
    $.ajax({
        url: url,
        data: null,
        success: function(data){
            $(".ingredients_table > tbody > tr:not(:has(th))").each(function(){
                var IID = $(this).attr("ID");
                var amount = $(this).find('td:eq(1)').html();
                var RID = data.data.id;
                var url_2 = "/ni?rid="+RID+"&amount="+amount+"&iid="+IID;
                count++;
                $.ajax({
                    url: url_2,
                    data: null,
                    sucess:refresh(),
                    dataType: "json"
                });

            });
        },
        dataType: "json"
    });
}

function refresh(){
    count--;
    if (count==0){
        location.reload();
    }
}

