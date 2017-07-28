var root = "";
window.onload= function() {
    var url = root + "sr?name=";
    var success = function(data) {
//        //console.log(data);
        var items = data.data.items;
        var table =  $("<table>").addClass("items_table");
        var header = $("<tr>").addClass("header");
        header.append($("<th>").text("Name"));
        table.append(header);
        items.forEach(function(it) {
            var row = $("<tr>");
            row.attr("ID",it.id);
            var name = $("<td>").text(it.name);
            row.append(name);
            table.append(row);
        });
        $("#table").append(table);

        $.ajax({
            url: "recipes",
            data: null,
            success: function(data){
                var items = data.data.items;
                //console.log(items);
                $(".items_table > tbody > tr:not(:has(th))").each(function(){
                    var ID =parseInt($(this).attr("ID"));
                    //console.log(ID);
                    if (items.includes(ID)){
                        $(this).css("background-color","#ea8383");
                        $(this).attr("Doable",false);
                    }else{
                        $(this).css("background-color","#95e56e")
                        $(this).attr("Doable",true);
                    }
                })
            },
            dataType: "json"
        });
    }
    $.ajax({
        url: url,
        data: null,
        success: success,
        dataType: "json"
    });
    $(".onlyDoable").change(function(){
        if (this.checked){
             $(".items_table > tbody > tr:not(:has(th))").each(function(){
                if ($(this).attr("Doable")=="true") {
                    $(this).show();
                }else{
                    $(this).hide();
                }
            })
        }else{
             $(".items_table > tbody > tr:not(:has(th))").each(function(){
                    $(this).show();
            });
        }
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
