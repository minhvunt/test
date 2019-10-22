Stock.Alert = AV.extend(AV.Module, {
	init: function()
	{
		var that = this;
		AV.load('3rdparty/jQuery/jGrowl/jquery.jgrowl_minimized.js','3rdparty/jQuery/jGrowl/jquery.jgrowl.css', function(){
			AV.Module.prototype.init.call(that);
		});
	},
	draw: function()
	{
		return '<div id="category_1" class="pags bound-category"></div><'+'script>$AV(\'StockBoard.Alert\').getItems();Stock.updateElementsPosition();<'+'/script>';
	},
	initEvents:function(){
		
	},
	itemOnclick:function(){
		var that = this;
		AV.dialog('StockBoard.Alert.AddItem');
		
		$('#alert-name').focus();
		return false;
	},
	update:function()
	{
		var symbols = '', that = this;
		for (var i in AV.Options.alertItems) {
			if(i && AV.Options.alertItems[i])
			{
				if(symbols) symbols += ',';
				symbols += i;
			}
		}
		if (symbols) {
			delete Stock.alertItems;
			Stock.alertItems = [];
			$.ajax({type: "GET",
				url: (location.host.search('localhost')!=-1)?'LiveChartHandler.php':'../../../LiveChartHandler.ashx',
				dataType:'json',
				data: {Symbol:symbols, type:'GetAlertStockData', ExchangeCode:(Stock.floor == 'HO')?'HOSE':(Stock.floor=='HA')?'HNX':'UPCOM'}, 
				cache: false,
				success: function(data) {
					Stock.alertItems = data.AlertStockData;
					$('#category_1').html(AV.template('AlertList', data));
					AV.Options.showAlertItems = true;
					//Stock.resize();
					
					//Thuc hien thao tac canh bao o day
					for (var j = 0, length = Stock.alertItems.length; j < length; j++) {
						var symbol = Stock.alertItems[j].Symbol;
						if(AV.Options.alertItems[symbol]){
							//Kiem tra loai cua canh bao, sau do dua ra cac alert tuong ung
							//$.jGrowl("Hello!" + symbol);
							var alertData = AV.Options.alertItems[symbol];
							var t = alertData.split(';');
							if(t.length>3){								
								var price = t[1];
								var vol = t[2];
								var percent = t[3];
								var check = false;
								if(price!=''){
									var op = price.substr(1,1);
									var val = price.substr(2);
									check = that.get(op,parseFloat(val),parseFloat(Stock.alertItems[j].FinishPrice));
									if(check) $.jGrowl(symbol+': '+Lang.Alert_by_price+' '+op+' '+val);
								}
								
								if(vol!=''){
									var op = vol.substr(1,1);
									var val = vol.substr(2);
									check = that.get(op,parseInt(val),parseInt(Stock.alertItems[j].TotalShare));
									if(check) $.jGrowl(symbol+': '+Lang.Alert_by_vol+' '+op+' '+val);
								}
								
								if(percent!=''){
									var op = percent.substr(3,1);
									var val = percent.substr(4);
									check = that.get(op,parseFloat(val),parseFloat(Stock.alertItems[j].AverageVol));
									if(check) $.jGrowl(symbol+': '+Lang.Alert_by_percent+' '+op+' '+val);
								}
							}
						}
					}
				}
			});
			return true;
		}
		return false;
	},
	get:function(op, expect, value){
		if(op=='>'){
			if(value>expect)	return true;
		}
		else if(op=='<'){
			if(value<expect)	return true;
		}
		else if(op=='='){
			if(expect==value)	return true;
		}
		return false;
	},
	getItems:function(){
		if(!this.update())
		{
			$('#category_1').html(AV.template('AlertList', {AlertStockData:[]}));
			AV.Options.showAlertItems = true;
			this.draw();
		}		
	},
	/*@duonghte : vẽ mã CK chọn trong Popup đưa lên đầu*/
	drawItem:function(data) { 
		var symbol = data.Symbol.toUpperCase(),
			status = (data.FinishPrice == 0 || data.FinishPrice==data.RefPrice)?'ss-basic':getState(data.FinishPrice,data.CeilingPrice,data.FloorPrice,data.RefPrice,1),
			emo = (status == 'ss-basic')?Stock.specialSymbols[2]:((status == 'ss-ceil' || status == 'ss-up')?Stock.specialSymbols[0]:Stock.specialSymbols[1]);
		return AV.template('AlertItem', {
			symbol:data.Symbol.toUpperCase(),
			finishPrice:data.FinishPrice,
			clsName:status,
			emo:emo,
			TotalShare:data.TotalShare,
			AverageVol:data.AverageVol
		});
	},
	/*
	@duonghte
	- hàm lưu các mã CK theo dõi chọn vào 1 mảng
	- hiển thị trên danh sách Top và List trong Popup
	- tham số : symbol -> mã CK vd :AAA, ACB ...
	*/
	add:function(s) {
		if(!AV.Options.alertItems[s])
		{
			var stockData = [], that = this;
			var symbolData = s.split(';');
			if(symbolData.length==4)
			{
				var symbol = symbolData[0];
				if (symbol) {
					$.ajax({type: "GET",
						url: (location.host.search('localhost')!=-1)?'LiveChartHandler.php':'../../../LiveChartHandler.ashx',
						dataType:'json',
						data: {Symbol:symbol, type:'GetAlertStockData', ExchangeCode:'HOSE'}, 
						cache: false,
						success: function(data) {
							Stock.alertItems.push(s);
							/*var stockData = [data['StockData'][0]['ID'], data['StockData'][0]['Symbol'],data['StockData'][0]['FinishPrice'],data['StockData'][0]['Diff'], data['StockData'][0]['DiffRate']] ;*/
							AV.Options.alertItems[symbol] = s;
							AV.Options.save('alertItems');
							if (!($('#lista_1 #wc'+symbol).length)) {
								$('#lista_1 .choose-symbol').removeClass('firstItem');
								var obj = $('#lista_1 .choose-symbol:first');
								if(obj)
								{
									obj.removeClass('choose-symbol')
									.addClass('selected-symbol')
									.attr('id',"wc"+symbol).html(that.drawItem(data.AlertStockData[0]));
									$('#lista_1 .choose-symbol:first').addClass('firstItem');
								}
								else
								{
									$('#lista_1').append('<li class="selected-symbol" id="wc'+symbol+'">'+that.drawItem(data.AlertStockData[0])+'</li>');
								}
								
								var code = '';
								for (var sym in AV.Options.alertItems)
								{
									code+='<li id="alert-'+sym+'"><div><div style="float:left" onclick="$AV(\'StockBoard.Alert\').updateData(\''+sym+'\');">'+sym+'</div><span class ="del-alert " onclick="$AV(\'StockBoard.Alert\').remove(\''+sym+'\', this.parentNode)">X</span></div><br clear="all" /></li>';
								}
								$('#alert-ol').html(code);
							}
						}
					});
				}
			}
		}
	},
	/*
	@duonghte
	- Hàm remove các mã CK khỏi mảng
	- Hàm remove các mã CK khỏi danh sách Top và danh sách trong Popup
	*/
	remove:function(symbol, obj) {
		$('#lista_1 .choose-symbol').removeClass('firstItem');
		$("#lista_1 #wc"+symbol).removeClass("selected-symbol").addClass('choose-symbol').removeAttr('id').html('<a class="show-menu" href="javascript:$AV(\'StockBoard.Alert\').itemOnclick();void(0)">'+Lang.selectAlertStock+'</a>');
		$('#alert-'+symbol).remove();
		AV.Options.alertItems[symbol] = null;
		delete(AV.Options.alertItems[symbol]);
		$('#lista_1 .choose-symbol:first').addClass('firstItem');
		AV.Options.save('alertItems');
	},
	removeAll:function() {
		$("#lista_1 .selected-symbol").removeClass("selected-symbol").addClass("choose-symbol").removeAttr('id').html('<a class="show-menu" href="">'+Lang.selectAlertStock+'</a>');
		$("#alert-ol li").remove();
		AV.Options.alertItems ={};
		AV.Options.save('alertItems');
	},
	updateData:function(symbol) {
		if(symbol!='undefined')
		{
			var data = AV.Options.alertItems[symbol];			
			if(data.length>5)
			{
				$('#alert-name').attr('value',symbol);
				var alertData = data.split(';');
				if(alertData.length>2)
				{
					var price = alertData[1];
					var vol = alertData[2];
					var percent = alertData[3];
					if(price!=''){
						var op = price.substr(1,1);
						var val = price.substr(2);
						$('#price-select').attr('value',op);
						$('#price-value').attr('value',val);
					}
					else
						$('#price-value').attr('value','');
					
					if(vol!=''){
						var op = vol.substr(1,1);
						var val = vol.substr(2);
						$('#vol-select').attr('value',op);
						$('#vol-value').attr('value',val);
					}
					else
						$('#vol-value').attr('value','');
					
					if(percent!=''){
						var op = percent.substr(3,1);
						var val = percent.substr(4);
						$('#percent-select').attr('value',op);
						$('#percent-value').attr('value',val);
					}
					else
						$('#percent-value').attr('value','');
				}
			}
		}
	},
	onOpen: function()
	{
		AV.Options.save('showAlertItems', 1);
	},
	onClose: function()
	{
		AV.Options.save('showAlertItems', 0);
	}
});