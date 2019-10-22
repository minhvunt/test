Watch = Stock.Watch = AV.extend(AV.Module, {
	layout:'WatchForm',
	init: function()
	{
//	    console.log('init watch');
		var that = this;
        AV.load('3rdparty/jquery.auto-complete.js', function () {
		    AV.Module.prototype.init.call(that);

		    //Stock.acceptKeypress = false;
		    $('#symbol-name').autocomplete(Stock.companies, {
		        width: 300,
		        formatMatch: function (row, i, max) {
		            return row;
		        },
		        formatResult: function (row) {
		            return row;
		        }
		    }).bind("result", function (data) {
		        var value = $('#symbol-name').val().toUpperCase();
		        $('#symbol-name').val('');
		        that.viewSymbol(value);
		    });
		});	    
	},
	draw: function () {
	    
	},
	initEvents: function()
	{
    	return false;
	},
	viewSymbol:function(value){
		var symbol = $.trim((value.indexOf('-') == -1) ? value.toUpperCase() : value.substr(0, value.indexOf('-'))).toUpperCase();;
		
		AV.StockBoard.currentSymbol = symbol;		
		Stock.board.chartOpen();
	}
});