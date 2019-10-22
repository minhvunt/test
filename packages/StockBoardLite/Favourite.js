Stock.Favourite = AV.extend(AV.Module, {
	init: function()
	{
		var that = this;
		AV.load('3rdparty/jQuery/mousewheel.js', '3rdparty/jQuery/jquery.scrollable.js', function(){
			AV.Module.prototype.init.call(that);
		});
	},
	draw: function()
	{
		return '<div id="category" class="pags bound-category"></div><'+'script>$AV(\'StockBoardLite.Favourite\').getItems();Stock.updateElementsPosition();<'+'/script>';
	},
	initEvents:function(){
			/*Second box*/				
		//$("#lista").supermenu({selected:true,selectedClass:'selected',oClass:'_2'});
		var step = 132;
		$(".supermenu_2").mousewheel(function(event, delta) {
			var marginLeft = parseInt($("#lista").css('marginLeft'));
			$("#lista").animate({ 
				marginLeft: Math.round(((delta > 0)?((marginLeft <-step)?marginLeft + step:0):((-marginLeft > (step*14 - $('.supermenu_2').width()))?marginLeft:marginLeft - step))/step)*step
			}, 200 );	
			event.stopPropagation();
			event.preventDefault();
		})
		/*MOUSEDOWN & MOUSEUP*/
		$("#izda").bind("mousedown",function() {
			var marginLeft = parseInt($("#lista").css('marginLeft'));
			$("#lista").animate({ 
				marginLeft: Math.round(((marginLeft <-step)?marginLeft + step:0)/step)*step
			}, 200 );
		});
		$("#dcha").bind("mousedown",function() {
			var marginLeft = parseInt($("#lista").css('marginLeft'));
			$("#lista").animate({ 
				marginLeft: Math.round(((-marginLeft > (step*($("#lista li").length-1) - $('.supermenu_2').width()))?marginLeft:marginLeft - step)/step)*step
			}, 200 );
		});
		
	},
	itemOnclick:function(){
		var that = this;
		AV.dialog('StockBoardLite.Favourite.AddItem');
		
		$('#favourite-name').focus();
		return false;
	},
	update:function()
	{
		var symbols = '', that = this;
		for (var i in AV.Options.favouriteItems) {
			if(i && AV.Options.favouriteItems[i])
			{
				if(symbols) symbols += ',';
				symbols += i;
			}
		}
		if (symbols) {
			delete Stock.favouriteItems;
			Stock.favouriteItems = [];
			$.ajax({type: "GET",
				url: (location.host.search('localhost')!=-1)?'LiveChartHandler.php':'../../../LiveChartHandler.ashx',
				dataType:'json',
				data: {Symbol:symbols, type:'GetStockData', ExchangeCode:(Stock.floor == 'HO')?'HOSE':'HNX'}, 
				cache: false,
				success: function(data) {
					Stock.favouriteItems = data.StockData;
					$('#category').html(AV.template('FavouriteList', data));
					AV.Options.showFavouriteItems = true;
					//Stock.resize();
				}
			});
			return true;
		}
		return false;
	},
	getItems:function(){
		if(!this.update())
		{
			$('#category').html(AV.template('FavouriteList', {StockData:[]}));
			AV.Options.showFavouriteItems = true;
			this.draw();
		}		
	},
	/*@duonghte : vẽ mã CK chọn trong Popup đưa lên đầu*/
	drawItem:function(data) { 
		var symbol = data.Symbol.toUpperCase(),
			status = (data.FinishPrice == 0 && data.Diff == 0)?'ss-basic':getState(data.FinishPrice,data.CeilingPrice,data.FloorPrice,data.RefPrice,1),
			emo = (status == 'ss-basic')?Stock.specialSymbols[2]:((status == 'ss-ceil' || status == 'ss-up')?Stock.specialSymbols[0]:Stock.specialSymbols[1]);
		return AV.template('FavouriteItem', {
			symbol:data.Symbol.toUpperCase(),
			finishPrice:data.FinishPrice,
			clsName:status,
			emo:emo,
			diff:Stock.diff(data.Diff),
			diffPercent:Stock.diff(Math.round(data.DiffRate*100)/100)
		});
	},
	/*
	@duonghte
	- hàm lưu các mã CK theo dõi chọn vào 1 mảng
	- hiển thị trên danh sách Top và List trong Popup
	- tham số : symbol -> mã CK vd :AAA, ACB ...
	*/
	add:function(symbol) {
		if(!AV.Options.favouriteItems[symbol])
		{
			var stockData = [], that = this;
			
			if (symbol) {
				$.ajax({type: "GET",
					url: (location.host.search('localhost')!=-1)?'LiveChartHandler.php':'../../../LiveChartHandler.ashx',
					dataType:'json',
					data: {Symbol:symbol, type:'GetStockData', ExchangeCode:'HOSE'}, 
					cache: false,
					success: function(data) {
						
						Stock.favouriteItems.push(data.StockData[0]);
						/*var stockData = [data['StockData'][0]['ID'], data['StockData'][0]['Symbol'],data['StockData'][0]['FinishPrice'],data['StockData'][0]['Diff'], data['StockData'][0]['DiffRate']] ;*/
						AV.Options.favouriteItems[symbol] = 1;
						AV.Options.save('favouriteItems');
						if (!($('#lista #wc'+symbol).length)) {
							$('#lista .choose-symbol').removeClass('firstItem');
							var obj = $('#lista .choose-symbol:first');
							if(obj)
							{
								obj.removeClass('choose-symbol')
								.addClass('selected-symbol')
								.attr('id',"wc"+symbol).html(that.drawItem(data.StockData[0]));
								$('#lista .choose-symbol:first').addClass('firstItem');
							}
							else
							{
								$('#lista').append('<li class="selected-symbol" id="wc'+symbol+'">'+that.drawItem(data.StockData[0])+'</li>');
							}
							var code = '';
							for (var j = 0, length = Stock.favouriteItems.length; j < length; j++) {
								{
									var sym = Stock.favouriteItems[j].Symbol;
									code+='<li id="favourite-'+sym+'"><div><div style="float:left">'+sym+'</div><span class ="del-favourite " onclick="$AV(\'StockBoardLite.Favourite\').remove(\''+sym+'\', this.parentNode)">X</span></div><br clear="all" /></li>';
								}
							}
							$('#favourite-ol').html(code);
						}
					}
				});
			}
		}
	},
	/*
	@duonghte
	- Hàm remove các mã CK khỏi mảng
	- Hàm remove các mã CK khỏi danh sách Top và danh sách trong Popup
	*/
	remove:function(symbol, obj) {
		$('#lista .choose-symbol').removeClass('firstItem');
		$("#lista #wc"+symbol).removeClass("selected-symbol").addClass('choose-symbol').removeAttr('id').html('<a class="show-menu" href="javascript:$AV(\'StockBoardLite.Favourite\').itemOnclick();void(0)">'+Lang.selectStock+'</a>');
		$('#favourite-'+symbol).remove();
		AV.Options.favouriteItems[symbol] = null;
		delete(AV.Options.favouriteItems[symbol]);
		$('#lista .choose-symbol:first').addClass('firstItem');
		AV.Options.save('favouriteItems');
	},
	removeAll:function() {
		$("#lista .selected-symbol").removeClass("selected-symbol").addClass("choose-symbol").removeAttr('id').html('<a class="show-menu" href="">'+Lang.selectStock+'</a>');
		$("#favourite-ol li").remove();
		AV.Options.favouriteItems ={};
		AV.Options.save('favouriteItems');
	},
	onOpen: function()
	{
		AV.Options.save('showFavouriteItems', 1);
	},
	onClose: function()
	{
		AV.Options.save('showFavouriteItems', 0);
	},
	moveNext:function(){
		for (var i in AV.Options.favouriteItems) {
			if(i && AV.Options.favouriteItems[i])
			{
				if(AV.Options.favouriteItems[i]==1 || AV.Options.favouriteItems[i]=='1'){
					$('#wc'+i).css('display','none');
					AV.Options.favouriteItems[i] = 2;
					break;
				}
			}
		}
	},
	moveBack:function(){
		var symbol = '';
		for (var i in AV.Options.favouriteItems) {
			if(i && AV.Options.favouriteItems[i])
			{
				if(AV.Options.favouriteItems[i]==2 || AV.Options.favouriteItems[i]=='2'){
					symbol = i;
				}
			}
		}
		$('#wc'+symbol).removeAttr("style");
		AV.Options.favouriteItems[symbol] = 1;
	}	
});