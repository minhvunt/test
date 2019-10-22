Stock.Favourite.AddItem = AV.extend(AV.Module, {
	layout:'AddFavouriteItemForm',
	init: function()
	{
		var that = this;
		AV.load('3rdparty/jQuery/autocomplete/jquery.autocomplete.js', function(){
			AV.Module.prototype.init.call(that);
		});
	},
	initEvents: function()
	{
		Stock.acceptKeypress = false;
		$('#favourite-name').autocomplete(Stock.companies, {
			width: 300,
			formatMatch: function(row, i, max) {
				return row;
			},
			formatResult: function(row) {
				return row;
			}
		}).bind("result", function(data){
			$('#add-favourite-form').submit();
		});
		var that = this;
		$('#add-favourite-form').submit(function(){
			var value = $('#favourite-name').val().toUpperCase();
			$('#favourite-name').val('');
			for(var i = 0; i < Stock.companies.length; i++)
			{
				if(Stock.companies[i] > value)
				{
					var symbol = $.trim((value.indexOf('-') == -1)?value.toUpperCase():value.substr(0,value.indexOf('-'))).toUpperCase();
					if(symbol)
					{
						$AV('LSXStockBoard.Favourite').add(symbol);
					}
					break;
				}
			}
			return false;
		});
	}
});