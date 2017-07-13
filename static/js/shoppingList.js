//var root = "http://localhost:8080/";
var root = "";
//var root = "http://172.19.3.156:8080/";
window.onload= function() {
    var url = root + "list";
    var success = function(data) {
        var items = data.data.items;
        var table =  $("<table>").addClass("list_table");
        var head = $("<thead>");
        table.append(head);
        var header = $("<tr>").addClass("header");
        header.append($("<th>").text("Name"));
        header.append($("<th>").text("QTY"));
        head.append(header);
        var body = $("<tbody>");
        table.append(body);
        items.forEach(function(it) {
            var row = $("<tr>");
            row.attr("ID",it.id);
            row.attr("stock",it.stock);
            var name = $("<td>").text(it.name);
            row.append(name);
            var qty = $("<td>").text(it.qty);
            row.append(qty);
            row.css("background-color","#ea8383");
            row.attr("Pressed","false");
            body.append(row);
        });
        $("#table").append(table)
        $("#table tbody tr").click(function(){
            if ($(this).attr("Pressed")=="true"){
                $(this).css("background-color","#ea8383");
                $(this).attr("Pressed","false");
            }else {
                $(this).css("background-color","#95e56e")
                $(this).attr("Pressed","true");
            }

        });
    }
    $.ajax({
        url: url,
        data: null,
        success: success,
        dataType: "json"
    });
}

var counter = 0;
function sendPurchased(){
   $(".list_table tr").each(function(){
        if ($(this).attr("Pressed")=="true"){
            var pur = $(this).children("td")[1].innerText;
            var url= "/stock?id=" +$(this).attr("id") + "&stock=" + (parseFloat($(this).attr("stock")) + parseFloat(pur));
            console.log(url);
            counter++;
            $.ajax({
                url: url,
                data: null,
                success: function(data){
                   if (data.code == 0) {
                       reload();
                       return;
                   } else {
                        console.log(data);
                   } 
                },
                dataType: "json"
            });
        }
   });
}

function reload(){
    counter--;
    if (counter == 0){
        location.reload();
    }}
