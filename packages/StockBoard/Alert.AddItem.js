Stock.Alert.AddItem = AV.extend(AV.Module, {
	layout:'AddAlertItemForm',
	init: function()
	{
		var that = this;
        AV.load('3rdparty/jquery.auto-complete.js', function () {
			AV.Module.prototype.init.call(that);
		});
	},
	initEvents: function()
	{
		Stock.acceptKeypress = false;
		$('#alert-name').autocomplete(Stock.companies, {
			width: 300,
			formatMatch: function(row, i, max) {
				return row;
			},
			formatResult: function(row) {
				return row;
			}
		})
	},
	submit: function(){
		var value = $('#alert-name').val().toUpperCase();
		$('#alert-name').val('');
		for(var i = 0; i < Stock.companies.length; i++)
		{
			if(Stock.companies[i] > value)
			{
				var symbol = $.trim((value.indexOf('-') == -1)?value.toUpperCase():value.substr(0,value.indexOf('-'))).toUpperCase();
				if(symbol)
				{
					var price = '0', volume = '0', percent = '0';
					if($('#price-value').val()!=''){
						try{
							price = parseFloat($('#price-value').val());
						}
						catch(err){}
					}
					
					if($('#vol-value').val()!=''){
						try{
							volume = parseInt($('#vol-value').val());
						}
						catch(err){}
					}
					
					if($('#percent-value').val()!=''){
						try{
							percent = parseFloat($('#percent-value').val());
						}
						catch(err){}
					}
					
					var pValue = '', vValue = '', perValue = '';
					pValue = (price!='0')?('p'+$('#price-select').val()+price):'';
					vValue = (volume!='0')?('v'+$('#vol-select').val()+volume):'';
					perValue = (percent!='0')?('per'+$('#percent-select').val()+percent):'';
					$AV('StockBoard.Alert').add(symbol+';'+pValue+';'+vValue+';'+perValue);
				}
				break;
			}
		}
		return false;
	}
});