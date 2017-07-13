function saveItem() {
    var name = $("#name").val();
    var stock = $("#stock").val();
    var min_stock = $("#min_stock").val();
    var max_stock = $("#max_stock").val();
    var unit = $("#unit").val();
    var url = "/n?name="+ name + "&stock=" + stock + "&min=" + min_stock + "&max=" + max_stock + "&unit=" + unit;
    $.ajax({
             url: url,
             data: null,
             success: function(data){
                   if (data.code == 0) {
                       location.reload();
                   } else {
                    console.log(data);
                   }
             },
             dataType: "json"
            });

}
