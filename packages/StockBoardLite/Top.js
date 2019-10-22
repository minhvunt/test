Stock.Top = AV.extend(AV.Module, {
	draw: function(reload)
	{
		var that = this;
		AV.read(Stock.dataFileName('top'), function(data){
			if(data)
			{				
				var blocks = data.split('@');
				Stock.statStocks = [];
				for(var i = 0; i < 3; i++)
				{
					if(blocks[i])
					{
						Stock.statStocks[i] = blocks[i].split('|');
						if(Stock.statStocks[i])
						{
							for(var j = 0; j < Stock.statStocks[i].length; j++)
							{
								var prices = Stock.statStocks[i][j].split(';');
								var clss = '';
								var icon = (prices[3] == 0)?Stock.specialSymbols[2]:((prices[3] > 0)?Stock.specialSymbols[0]:Stock.specialSymbols[1]);
								var emo = (prices[3] > 0)?'+':'';
								if(i == 2)
								{
									var status = (prices[3] == 0)?'ss-basic':((prices[3] > 0)?'ss-up':'ss-down');
									clss = ' class="'+status+'"';
								}
								prices[3] = Stock.diff(prices[3]);
								prices[4] = Stock.diff(prices[4]);
								Stock.statStocks[i][j] = {
									data:prices,
									clss:clss,
									icon:icon,
									emo:emo
								};
							}
						}
					}
				}

				that.html(AV.template('TopStock'));
			}
		});
		
		return '';
	},
	update: function()
	{
		var that = this;
		$.ajax({type: "GET",
				url: Stock.dataFileName('top'),
				cache: false,
				success: function(data) {
				if(data)
				{				
					var blocks = data.split('@');
					Stock.statStocks = [];
					for(var i = 0; i < 3; i++)
					{
						if(blocks[i])
						{
							Stock.statStocks[i] = blocks[i].split('|');
							if(Stock.statStocks[i])
							{
								for(var j = 0; j < Stock.statStocks[i].length; j++)
								{
									var prices = Stock.statStocks[i][j].split(';');
									var clss = '';
									var icon = (prices[3] == 0)?Stock.specialSymbols[2]:((prices[3] > 0)?Stock.specialSymbols[0]:Stock.specialSymbols[1]);
									var emo = (prices[3] > 0)?'+':'';
									if(i == 2)
									{
										var status = (prices[3] == 0)?'ss-basic':((prices[3] > 0)?'ss-up':'ss-down');
										clss = ' class="'+status+'"';
									}
									prices[3] = Stock.diff(prices[3]);
									prices[4] = Stock.diff(prices[4]);
									Stock.statStocks[i][j] = {
										data:prices,
										clss:clss,
										icon:icon,
										emo:emo
									};
								}
							}
						}
					}
		
					$('#Dialog-StockBoardLite-Top').html(AV.template('TopStock', Stock));
					AV.Options.showTopStock = true;
				}
			}
		});
		
		return '';
	},
	onOpen: function()
	{
		AV.Options.save('showTopReport', 1);
	},
	onClose: function()
	{
		AV.Options.save('showTopReport', 0);
	}
});