Stock.Options = AV.extend(AV.Module, {
	saveSymbols: true,
	saveConfiguration:true,
	saveOption:function(name, value)
	{
		if(typeof(value)!='undefined' && AV.Options[name] != value)
		{
			AV.Options[name] = value;
			
		}
	},
	saveOptions:function(){
		//location = '#';
		var that = this;
		//this.saveTopSymbolsOption();
		/* Chọn các mã CK để hiện : @SangNT*/
		
		if(this.saveSymbols)
		{
			delete AV.Options.showSymbols[Stock.floor];
			AV.Options.showSymbols[Stock.floor] = {};
			var obj = $('#selectSymbols');
			if(obj.length)
			{
				var i = 1;
				for(var j in Stock.allSymbols)
				{
					if(obj.find('option[selected][value='+j+']').length)
					{
						AV.Options.showSymbols[Stock.floor][j] = i++;
					}
					  /*obj.find('option[selected]').each(function(){
						var name = $(this).attr('value');
						AV.Options.showSymbols[Stock.floor][name] = i++;
					});*/
				}
			}
			else
			{
				$('#tableChooseSymbols tr td input:checkbox:checked').each(function(){
					var name = $(this).attr('name');
					AV.Options.showSymbols[Stock.floor][name] = 1;
				});
			}
			var all = true;
			for(var i in Stock.allSymbols)
			{
				if(!AV.Options.showSymbols[Stock.floor][i])
				{
					all = false;
					
					break;
				}
			}
			if(all) AV.Options.showSymbols[Stock.floor] = false;
		}
		if(this.saveConfiguration)
		{
			this.saveOption('screenWidth', $('input[name=ScreenWidth]:checked').val());
			this.saveOption('lineCount', $('#txtLineCount').val());
			this.saveOption('scrollDelay', parseInt($('#txtScrollInterval').val()));
			this.saveOption('waitingTime', $('#txtWaitingTime').val());
			if(!AV.Options.tableType || typeof(AV.Options.tableType) != 'object') AV.Options.tableType = {};
			AV.Options.tableType[Stock.floor] = $('input[name=TableType]:checked').val();
			if($('input[name=fontStyle]').length)
			{
				this.saveOption('fontStyle', $('input[name=fontStyle]:checked').val());
			}
			if($('input[name=volColor]').length)
			{
				this.saveOption('volColor', $('input[name=volColor]:checked').val()?1:0);
			}
			else
			{
				this.saveOption('volColor', AV.Options.definitions.volColor);
			}
			this.saveOption('boardStyle', $('input[name=selectBoard]:checked').val());
			AV.Options.hideColumns[Stock.floor] = 
			//this.saveOption('hideColumns', 
			[
				$('input[name=chkShowBuyVolume]').attr('checked')?0:1,//buyVolume
				$('input[name=chkShowSellVolume]').attr('checked')?0:1,//sellVolume
				$('input[name=chkShowBuyOrderCount]').attr('checked')?0:1,//buyOrderCount
				$('input[name=chkShowSellOrderCount]').attr('checked')?0:1,//sellOrderCount
				$('input[name=chkShowForeignBuy]').attr('checked')?0:1,//foreignBuy
				$('input[name=chkShowForeignSell]').attr('checked')?0:1,//foreignSell
				$('input[name=chkShowCurrentRoom]').attr('checked')?0:1,//currentRoom
				$('input[name=chkShowAverageVol]').attr('checked') ? 0 : 1,//AverageVol
				$('input[name=chkShowOfferVol4]').attr('checked') ? 0 : 1,//AverageVol
				$('input[name=chkShowBidVol4]').attr('checked') ? 0 : 1//AverageVol
			];
		}
		AV.Options.save();		
		
		location.reload();
	},
	draw: function()
	{
		Stock.acceptKeypress = false;
		this.ready(function(){
			this.initEvents();
		});
		return AV.template('OptionsForm', this);
	},
	initEvents: function(){
		$('#rbt'+((AV.Options.screenWidth == '100%')?'100percent':AV.Options.screenWidth)).attr('checked','checked');
		$('#rbt'+AV.Options.tableType[Stock.floor]).attr('checked','checked');
		$('#rbtFont'+AV.Options.fontStyle).attr('checked','checked');
		$('#rbtBoard'+AV.Options.boardStyle).attr('checked','checked');
	},
	checkAll:function(){
		$('#tableSymbols tr td input:checkbox').each(function(){
			$(this).attr('checked','1');
		});
	},
	unCheckAll:function(){
		$('#tableSymbols tr td input:checkbox').each(function(){
			$(this).removeAttr('checked');
		});
	},
	
	changeFontStyle:function(style) {
		
		if (style == 'boldAll') {
			$('.stockBoard, #stockBoard').css('font-weight','normal');
		}else if (style=='normal') {
			$('.stockBoard').css('font-weight','bold');
			this.addRule('.mainColumn span','font-weight:bold')
		}else {
			$('.stockBoard').css('font-weight','bold');
			this.oldFontCssIndex = this.addRule('.mainColumn','font-weight:normal');
			this.addRule('.mainColumn span','font-weight:normal')
		}
		$('input[name=fontStyle][value='+style+']').attr('checked','checked');
	},
	checkSession:function(session, value)
	{
		if(session==1){
			$('#chkShowBuyVolume').attr('checked',value);
			$('#chkShowSellVolume').attr('checked',value);
		}
		else if(session==2){
			$('#chkShowBuyOrderCount').attr('checked',value);
			$('#chkShowSellOrderCount').attr('checked',value);
		}
	},
	addRule:function(name, value)
	{
		try{
			if($.browser.msie)
			{
				if(typeof(this.oldCssIndexes[name]) != 'undefined')
				{
					
					document.styleSheets[1].removeRule(this.oldCssIndexes[name]);
					
				}
				this.oldCssIndexes[name] = document.styleSheets[1].rules.length;
				
					document.styleSheets[1].addRule(name, value, this.oldCssIndexes[name]);
				
				return 0;
			}
			else
			{
				if(typeof(this.oldCssIndexes[name]) != 'undefined')
				{
					document.styleSheets[1].deleteRule(this.oldCssIndexes[name]);
				}
				try{
					if(document.styleSheets[1] && document.styleSheets[1].cssRules && document.styleSheets[1].cssRules.length)
					{
						this.oldCssIndexes[name] = document.styleSheets[1].cssRules.length;
						return document.styleSheets[1].insertRule(name+'{'+value+'}', this.oldCssIndexes[name]);
					}
				}
				catch(e)
				{
				}
			}
		}
		catch(e)
		{
		}
	}
});