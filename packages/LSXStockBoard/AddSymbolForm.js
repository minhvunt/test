Stock.AddSymbolForm = AV.extend(AV.Module, {
	draw:function(){
		return AV.template('AddSymbolForm');
	},
	initForm: function()
	{
		var that = this;
		$('#add-symbol-form, #add-symbol-float-form').submit(function(){
			that.cmd('add', this.symbol.value);
			this.symbol.value = '';
			return false;
		});
		AV.load('3rdparty/jQuery/autocomplete/jquery.autocomplete.js', function(){
			$('.add-symbol-input').autocomplete(Stock.companies, {
				width: 300,
				formatMatch: function(row, i, max) {
					return row;
				},
				formatResult: function(row) {
					return row;
				}
			}).bind("result", function(e){
				that.cmd('add', this.value);
				this.value = '';
			});
		});
		AV.load('3rdparty/jQuery/ui/ui.core.js', '3rdparty/jQuery/validate/jquery.validate.min.js', function(){
			AV.load('3rdparty/jQuery/ui/ui.draggable.js', function(){
				$('#add-symbol-div, #add-category-div').draggable({cancel:'form', containment: 'body'});
				$('#add-category-float-form').validate({
					rules:{
						name:{
							required:true
						}
					},
					messages:{
						name:{
							required:Lang.Name_is_required
						}
					},
					submitHandler: function(form){
						$AV('LSXStockBoard.AddSymbolForm').addListClick($.trim(form.name.value), $.trim(form.symbols.value))
					}
				});
			});
		});
	},
	filterSymbolList: function(floor){
		var symbols = {}, allow = {};
		switch(floor)
		{
			case 'HOSE': allow[1] = true; break;
			case 'HNX': allow[2] = true; break;
			case 'UPCOM': allow[3] = true; break;
			case 'HOSE,HNX': allow[1] = allow[2] = true; break;
			default: allow[1] = allow[2] = allow[3] = true; break;
		}
		var floors = {1:'HOSE', 2:'HNX', 3: 'UPCOM'}, obj = $('#addSymbol-symbolList');
		obj.find('tr').remove();
		for(var i in Stock.allSymbols)
		{
			var symbol = Stock.allSymbols[i];
			if(allow[symbol[6]] && !AV.Options.showSymbols[Stock.floor][i])
			{
				obj.append('<tr onmouseover="Stock.board.trOver(this)" onmouseout="Stock.board.trOut(this)" onclick="$AV(\'LSXStockBoard.AddSymbolForm\').cmd(\'add\', \''+i+'\');$(this).remove();"><td>'+floors[symbol[6]]+'</td><td>'+i+'</td><td>'+symbol[4]+'</td></tr>');
			}
		}
		$('#add-symbol-float-form input:first').focus();
	},
	cmd: function(cmd, symbol){
		if(!symbol)
		{
			symbol = $('#add-symbol-input').val().toUpperCase();
		}
		
		if(!symbol)return;
		$('#add-symbol-input').val('');
		if(symbol.indexOf(' -') != -1)
		{
			symbol = symbol.substr(0, symbol.indexOf(' -'));
		}
		/*if(!Stock.securities[symbol])
		{
			return;
		}*/
		if(!Stock.allSymbols[symbol])
		{
			AV.alert('Mã không hợp lệ!');
			return;
		}
		if(!cmd)
		{
			cmd = (AV.Options.showSymbols[Stock.floor][symbol])?'remove':'add';
		}
		var list = $('#select-list').val();
		if(cmd == 'add')
		{
			if(AV.Options.showSymbols[Stock.floor][symbol]) return;
			if($('#add-category-div').css('display') != 'none')
			{
				var value = $('#add-category-div input[name="symbols"]').val();
				$('#add-category-div input[name="symbols"]').val((value?value+',':'')+symbol);
				$('#add-symbol-div').hide();
			}
			else
			{
				AV.Options.showSymbols[Stock.floor][symbol] = 1;
				if(list)
				{
					AV.read((Stock.localhost?'http://eazytrade.vn/':'')+'/DesktopModules/AG.TradingOnline/Handler/ThinClient/MarketWatch/UpdateSymbol.aspx?List='+list+'&Symbol='+symbol+'&t='+(new Date().getTime()), function(response){
						if(response == 0)
						{
							AV.alert('Lỗi hệ thống, không thêm được!');
						}
					});
				}
				Stock.orderedItems.push(symbol);
				Stock.orderedItems.sort(Stock.Board.prototype.columnOrder);
			}
		}
		else
		if(AV.Options.showSymbols[Stock.floor][symbol]){
			AV.Options.showSymbols[Stock.floor][symbol] = null;
			delete AV.Options.showSymbols[Stock.floor][symbol];
			for(var i = 0; i < Stock.orderedItems.length; i++)
			{
				if(Stock.orderedItems[i] == symbol)
				{
					Stock.orderedItems.splice(i, 1);
					break;
				}
			}
			if(list)
			{
				AV.read((Stock.localhost?'http://eazytrade.vn/':'')+'/DesktopModules/AG.TradingOnline/Handler/ThinClient/MarketWatch/DeleteSymbol.aspx?List='+list+'&Symbol='+symbol+'&t='+(new Date().getTime()), function(response){
					if(response == 0)
					{
						AV.alert('Lỗi hệ thống, không xóa được!');
					}
				});
			}
		}
		AV.Options.save('showSymbols');
		$('.stockBoard tbody tr').remove();
		Stock.board.drawContent();
	},
	selectList: function(id)
	{
		if(id)
		{
			AV.read((Stock.localhost?'http://eazytrade.vn/':'')+'/DesktopModules/AG.TradingOnline/Handler/ThinClient/MarketWatch/GetSymbol.aspx?List='+id+'&t='+(new Date().getTime())+'&t='+(new Date().getTime()), {dataType:'html'}, function(response){
				if(response)
				{
					AV.Options.showSymbols[Stock.floor] = {};
					Stock.orderedItems = [];
					var list = response.split('-'), stocks = AV.Options.showSymbols[Stock.floor];
					for(var i = 0; i < list.length; i++)
					{
						stocks[list[i]] = 1;
						Stock.orderedItems.push(list[i]);
					}
					AV.Options.save('showSymbols');
					$('.stockBoard tbody tr').remove();
					Stock.board.drawContent();
				}
			});
		}
	},
	addListClick: function(name, symbols)
	{
		//var name = prompt('Nhập tên danh sách để lưu lại');
		if(name)
		{
			if(!symbols)
			{
				AV.alert('Chưa nhập mã khởi tạo!');
				return;
			}
			var that = this;
			symbols = symbols.toUpperCase();
			var stocks = symbols.split(',');
			for(var i = 0; i < stocks.length; i++)
			{
				if(!Stock.allSymbols[stocks[i]])
				{
					AV.alert('Mã không hợp lệ!');
					return;
				}
			}
			AV.read((Stock.localhost?'http://eazytrade.vn/':'')+'/DesktopModules/AG.TradingOnline/Handler/ThinClient/MarketWatch/UpdateList.aspx?Name='+name+'&Symbol='+symbols+'&t='+(new Date().getTime()), function(response){
				if(response < 0)
				{
					AV.alert('Lỗi hệ thống, không thêm được!');
				}
				else
				if(response == 0)
				{
					 if(symbols=='')
				    {
				        AV.alert('Nhập mã chứng khoán khởi tạo danh mục!');
				    }
				    else
				    {
					    AV.alert('Trùng tên danh mục đã tồn tại, không thêm được!');
					}
				}
				else
				{
					$('#select-list option[value=""]').remove();
					$('#add-category-div').hide();
					var sel = $('#select-list');
					sel.append('<option value="'+response+'" selected>'+name+'</option>');
					that.selectList(response);
				}
			});
		}
	},
	removeListClick: function(){
		var id = $('#select-list').val();
		if(id)
		{
			AV.read((Stock.localhost?'http://eazytrade.vn/':'')+'/DesktopModules/AG.TradingOnline/Handler/ThinClient/MarketWatch/DeleteList.aspx?List='+id+'&t='+(new Date().getTime()), function(response){
				if(response <= 0)
				{
					AV.alert('Lỗi hệ thống!');
				}
				else
				{
					AV.Options.showSymbols[Stock.floor] = {};
					Stock.orderedItems = [];
					AV.Options.save('showSymbols');
					$('.stockBoard tbody tr').remove();
					$('#select-list option[value='+id+']').remove();
					if($('#select-list option').length == 1)
					{
						$('#select-list').append('<option value="">Danh mục</option>');
					}
				}
			});
		}
	},
	saveDefaultList: function()
	{
		var id = $('#select-list').val();
		AV.read((Stock.localhost?'http://eazytrade.vn/':'')+'/DesktopModules/AG.TradingOnline/Handler/ThinClient/MarketWatch/SetDefaultList.aspx?List='+id+'&t='+(new Date().getTime()), function(response){
			if(response <= 0)
			{
				AV.alert('Lỗi hệ thống!');
			}
			else
			{
				AV.alert('Cập nhật thành công!');
			}
		});
		//AV.Options.currentList = $('#select-list').val(); AV.Options.save('currentList');
		//AV.alert('Save default list: '+$('#select-list').val()+' (Sua o trong ham /packages/LSXStockBoard/AddSymbolForm.js - saveDefaultList())');
	},
	showMenu: function(symbol, obj, event)
	{
		var id = obj.id;
		if(id) id = obj.id.split('-')[1];
		if(id == 3 || id == 5 || id == 1 || id == 11 || id == 13 || id == 15){
			Stock.currentPrice = obj.innerHTML;
		}
		else
		if(Stock.securities[symbol])
		{
			Stock.currentPrice = Stock.securities[symbol].prices[8];
		}
		else
		{
			Stock.currentPrice = '';
		}
		var $j = (parent != window)?parent.$:$, parentOffset = (parent != window)?$j('#fraQuotes').offset():{top:0, left:0};
		AV.$j = $j;
		if(parent != window && $j('#board-menu').length == 0)
		{
			$j('body').append('<link class="boardCss" id="css4" rel="stylesheet" type="text/css" href="'+AV.path+'skins/'+AV.App.layout+'/contextMenu.css"/><div id="board-menu" class="sub-menu" style="display:none">'+$('#board-menu').html()+'</div>');
			$(document).click(function(){
				$j('#board-menu').hide();
			});
			$j(parent.document).click(function(){
				$j('#board-menu').hide();
			});
		}
		
		if(!symbol)
		{
			$j('#board-menu li a.menuForSymbol').css('color', '#888');
			$j('#board-menu li a.menuForSymbol').attr('rel','disabled');
		}
		else
		{
			$j('#board-menu li a.menuForSymbol').css('color', 'black');
			$j('#board-menu li a.menuForSymbol').attr('rel','');
		}
		$j('#board-menu').toggle();
		//var offset = $(obj).position();
		var offset = {left: parseInt(event.clientX)+parseInt(parentOffset.left), top: parseInt(event.clientY)+parseInt(parentOffset.top)};
		$j('#board-menu').css({left:((offset?offset.left:0))+'px',top:((offset?offset.top:0))+'px'});
		this.isShowMenu = true;
		this.currentContextSymbol = symbol;
	},
	buy: function(symbol)
	{
		parent.Order_Buy_QuickOrder('Buy', symbol, Stock.floor);
		//AV.alert('Buy symbol: '+symbol+'; Price: '+Stock.currentPrice+'; Floor: '+Stock.floor+' (Sua o trong ham /packages/LSXStockBoard/AddSymbolForm.js - buy())');
	},
	sell: function(symbol)
	{
		parent.Order_Buy_QuickOrder('Sell', symbol, Stock.floor);
		//AV.alert('Sell symbol: '+symbol+'; Price: '+Stock.currentPrice+'; Floor: '+Stock.floor+' (Sua o trong ham /packages/LSXStockBoard/AddSymbolForm.js - sell())');
	}
});