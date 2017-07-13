//var root = "http://localhost:8080/";
var root = "http://172.19.3.156:8080/";
window.onload= function() {
    var url = root + "s?name=";
    var success = function(data) {
        console.log(data)
        var items = data.data.items;
        var table =  $("<table>").addClass("items_table");
        var header = $("<tr>").addClass("header");
        header.append($("<th>").text("Name"));
        header.append($("<th>").text("Stock"));
        header.append($("<th>").text("Min_Stock"));
        header.append($("<th>").text("Max_Stock"));
        header.append($("<th>").text("Unit"));
        table.append(header);
        items.forEach(function(it) {
            var row = $("<tr>").addClass("row_"+it.id);
            var name = $("<td>").text(it.name);
            row.append(name);
            var stock = $("<td>").text(it.stock);
            row.append(stock);
            var min_stock = $("<td>").text(it.min_stock);
            row.append(min_stock);
            var max_stock = $("<td>").text(it.max_stock);
            row.append(max_stock);
            var unit = $("<td>").text(it.unit);
            row.append(unit);
            table.append(row);
        });
        $("#table").append(table)
    }
    $.ajax({
        url: url,
        data: null,
        success: success,
        dataType: "json"
    });
}


function filterTable(){
    var input = $("#search");
    var name = input.val().toUpperCase();
    $(".items_table > tbody > tr:not(:has(th))").each(function(){
        var item_name = $(this).children("td").first();
        if (item_name.html().toUpperCase().includes(name) || name == "") {
            $(this).show();
        }else{
            $(this).hide();
        }
    })

}
