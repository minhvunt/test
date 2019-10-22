Stock.Board = AV.extend(AV.Module, {
    init: function() {
        Stock.board = this;
        AV.Module.prototype.init.call(this);
    },
    draw: function() {
        return AV.template('Board' + ((window.screen.availWidth > 1024 && AV.Options.screenWidth != '1000') ? '1280' : ''));
    },
    order: function(column, obj) {
        if (obj) {
            var code = obj.innerHTML;
            if (code.search('▲') != -1) {
                AV.Options.save('orderDir', -1);
                code = code.replace(' ▲', '~');
            }
            else {
                AV.Options.save('orderDir', 1);
                code += '^';
            }
            obj.innerHTML = code;
            var html = obj.parentNode.parentNode.innerHTML.replace(' ▲', '').replace(' ▼', '').replace('~', ' ▼').replace('^', ' ▲');
            if ($.browser.msie) {
                $(obj.parentNode.parentNode).html(html);
            }
            else {
                obj.parentNode.parentNode.innerHTML = html;
            }

        }
        AV.Options.save('orderingColumn', column);

        Stock.orderedItems.sort(Stock.Board.prototype.columnOrder);
        for (var i = 0; i < Stock.orderedItems.length; i++)
            if (Stock.allSymbols[Stock.orderedItems[i]]) {
            Stock.allSymbols[Stock.orderedItems[i]][5] = i;
        }
        if (Stock.fixHeaderBlockDisplay == 'none') {
            $('#tableFixHeader>thead').html($('#sb-hd').html());
        }
        else {
            $('#sb-hd').html($('#tableFixHeader>thead').html());
        }
        Stock.isProccessing = true;
        //var $selectedBoardData = $('#selectedBoardData'), $boardData = $('#boardData'), $hiddenBoardData = $('#hiddenBoardData');

        for (var i = 0, length = Stock.orderedItems.length; i < length; i++) {
            var symbol = Stock.orderedItems[i];
            if (!AV.Options.showSymbols[Stock.floor] || AV.Options.showSymbols[Stock.floor][symbol]) {
                var obj = $('#tr' + symbol +'-0');
				obj.attr('style','');
                obj.parent().append(obj);
				
				var obj1 = $('#tr' + symbol +'-1');
				obj1.attr('style','');
				if(i<length-1)
					obj1.attr('style','border-bottom:2px solid #CCC');
				obj1.parent().append(obj1);
            }
        }
        Stock.isProccessing = false;
    },
    drawContent: function(i) {
        if (!i) {
            i = 0;
        }
        var selectedCode = '', code = '', ie = $.browser.msie, end = parseInt(i) + 20;

        for (var length = Stock.orderedItems.length; i < length && i < end; i++)
            if (Stock.securities[Stock.orderedItems[i]]) {
            var symbol = Stock.securities[Stock.orderedItems[i]].symbol;
            if (AV.Options.showSymbols[Stock.floor][symbol] || !AV.Options.showSymbols[Stock.floor]) {
                var trCode = this.drawRow(Stock.securities[symbol], i);
                if (typeof (AV.Options.topSymbols[symbol]) != 'undefined') {
                    selectedCode += trCode;
                }
                else {
                    code += trCode;
                }
            }
        }
        $('#selectedBoardData').append(selectedCode);

        if (selectedCode) {
            $('#selectedBoardData').show();
        }
        $('#boardData').append(code);
        if (end < Stock.orderedItems.length) {
            setTimeout(function() { Stock.board.drawContent(end); }, 300);
        }
        else {
            /*
			if ($.browser.msie) {
                $('#selectedBoardData>tr:last').addClass('lastRow');
            }
            if (AV.App.zebraTable) {
                $('.stockBoard>tbody>tr:even').removeClass('odd').addClass('even');
                $('.stockBoard>tbody>tr:odd').removeClass('even').addClass('odd');
            }
			*/
			$('.stockBoard>tbody>tr:last').attr('style','');
            Stock.contentReady = true;
            Stock.allowedPos = $("#stockBoard").height() - AV.Options.lineCount * AV.Options.lineHeight;
            if (typeof (ScrollTableObj) != 'undefined') {
                ScrollTableObj.allowedPos = Stock.allowedPos;
            }
            Stock.updateElementsPosition();

            this.initEvents();
        }

    },
    drawRow: function(security, i) {
		
        var symbol = security.symbol;
        if (!(!AV.Options.showSymbols[Stock.floor] || AV.Options.showSymbols[Stock.floor][symbol] || !Stock.allSymbols[symbol])) {
            return '';
        }
        return AV.template('BoardRow',
			{
			    prices: security.prices,
			    stock: Stock.allSymbols[symbol],
			    tradeStatuses: security.tradeStatuses,
			    hightlight: security.hightlight,
			    map: AV.App.map[Stock.floor],
			    security: security,
			    symbol: symbol,
			    ie: $.browser.msie,
			    i: i
			}
		);
    },

    trOver: function(obj) {
        if (Stock.oldBgObj) {
            Stock.oldBgObj.style.backgroundColor = Stock.oldBgColor;
            Stock.oldBgObj = false;
        }
        Stock.oldBgColor = obj.style.backgroundColor;
        Stock.oldBgObj = obj;
        //obj.style.backgroundColor = '#555';
        $(obj).addClass('hightlight');
    },
    trOut: function(obj) {
        if (Stock.oldBgObj) {
            Stock.oldBgObj.style.backgroundColor = Stock.oldBgColor;
            $(obj).removeClass('hightlight');
            Stock.oldBgObj = false;
        }
    },
    trDblClk: function(obj) {
        this.trOut(obj);
        var symbol = $(obj).find('th').attr('id');
        symbol = symbol.substr(0, symbol.indexOf('-'));
        if (AV.Options.topSymbols[symbol]) {
            Stock.goReturnSymbols(symbol);
        }
        else {
            Stock.goTopSymbols(symbol);
        }
        if (AV.App.zebraTable) {
            $('.stockBoard>tbody>tr:even').removeClass('odd').addClass('even');
            $('.stockBoard>tbody>tr:odd').removeClass('even').addClass('odd');
        }
    },
    initScrollTable: function() {
        //Stock.destroyScrollTable();
        var options = AV.Options;
        switch (options.tableType[Stock.floor]) {
            case 'pageReplace':
                AV.ExecQueue.add(function() {
                    var lineHeight = $('#boardData tr:first').next().height();
                    Stock.scrollTable(options.waitingTime ? options.waitingTime : 20000, (lineHeight ? lineHeight : 24) * AV.Options.lineCount);
                }, function() { return $('#boardData tr:first').height(); });
                break;
            case 'infinite':
                $('#selectedBoardData').insertAfter($('#tableFixHeader thead'));
                Stock.scrollTable((options.scrollDelay > 10) ? options.scrollDelay : 50, 1);
                break;
            default:
                options.tableType[Stock.floor] = 'normal';
                $("#scrollFixHeader").css("display", "none");
                break;
        }
    },


    changeStatusClass: function(obj, oldClassName, newClassName) {
        if (oldClassName.indexOf(newClassName) == -1) {
            obj.className = oldClassName.replace('ss-basic', '').replace('ss-up', '').replace('ss-down', '').replace('ss-floor', '').replace('ss-ceil', '').replace('other-ss-basic', '').replace('other-ss-up', '').replace('other-ss-down', '').replace('other-ss-floor', '').replace('other-ss-ceil', '') + newClassName;
        }
    },
    changeTdColor: function(td, i) {
        var temp = AV.App.disableHighlight;
        if (temp) {
            if (temp.indexOf(',' + i + ',') == -1) {
                var bgColor = AV.App.hightlightColor;
                if (bgColor == '1color')
                    bgColor = '#f0ff00';
                td.style.backgroundColor = bgColor;
                td.style.color = AV.App.texthightlightColor ? AV.App.texthightlightColor : '';
            }
        }
        else {
            var bgColor = AV.App.hightlightColor;
            if (bgColor == '1color')
                bgColor = '#f0ff00';
            td.style.backgroundColor = bgColor;
            if (AV.App.texthightlightColor)
                td.style.color = AV.App.texthightlightColor ? AV.App.texthightlightColor : '';
        }
        //}		
    },
    updateRow: function(security) {
        var symbol = security.symbol, stock = Stock, stockInfo = stock.allSymbols[symbol];
        if (!(!AV.Options.showSymbols[stock.floor] || AV.Options.showSymbols[stock.floor][symbol])) {
            Stock.processCount--;
            return;
        }
        var prices = security.prices,
			tradeStatuses = security.tradeStatuses,
			hightlight = security.hightlight,
			oldHightLight = security.oldHightLight;
        if (!oldHightLight) {
            oldHightLight = security.oldHightLight = [];
        }
        var map = AV.App.map[stock.floor];

        for (var j = 4, length = map.length; j < length; j++) {
            var i = map[j];
            //if(i == 1)alert(symbol);
            //if(symbol == 'ACL' && i == 19)alert(hightlight[i]);
            if (hightlight[i]) //QuangNN - 31/03/2010 Nhay mau o day
            {
                var td = document.getElementById(symbol + '-' + i);
                if (!td) { continue; }
				newClassName = tradeStatuses[i];
				var newColor = AV.App.colors[newClassName];
				var newBgColor = AV.App.hightlightColor;				
				var newValue = '';
				td.style.backgroundColor = newBgColor;
				//Neu ma gia thay doi thi KL cung thay doi theo
				if (i==1 || i==3 || i==5 || i==7 || i==9 || i==15 || i==17 || i==19 || i==21 || i==23 || i==25 || i==26 || i==32 || i==34){
					newColor = getStateColor(prices[i], stockInfo[1], stockInfo[2], stockInfo[3], i);
					var tdVol = document.getElementById(symbol + '-' + (i+1));
					tdVol.style.color = newColor;
				}
				else if (i == 2 || i == 4 || i == 6 || i == 8 || i == 10 || i == 16 || i == 18 || i == 20 || i == 22 || i == 24 || i==33 || i==35){
					newColor = getStateColor(prices[i - 1], stockInfo[1], stockInfo[2], stockInfo[3], i);
				}
				else if(i==12){
					var td0 = document.getElementById(symbol + '-0');
					td0.style.color = newColor;
					var td11 = document.getElementById(symbol + '-11');
					td11.style.color = newColor;
					var td13 = document.getElementById(symbol + '-13');
					td13.style.color = newColor;
					var td14 = document.getElementById(symbol + '-14');
					td14.style.color = newColor;
					var td27 = document.getElementById(symbol + '-27');
					td27.style.color = newColor;
					var td28 = document.getElementById(symbol + '-28');
					td28.style.color = newColor;
				}
				
				td.style.color = newColor;
				if ((prices[i] && prices[i] != '0') || i == 13 || i == 29 || i == 30) {
					if (i == 2 || i == 4 || i == 6 || i == 8 || i == 10 || i == 16 || i == 18 || i == 20 || i == 22 || i == 24 || i==27 || i==28 || i == 29 || i == 30 || i==33 || i==35 || i==13 || i==14) {
						newValue = Stock.weightFormat(prices[i]);
					}
					else {
						newValue = AV.numberFormat(prices[i]);
					}
				}
				else {
					newValue = Stock.specialSymbols[3];
				}
				td[AV.innerText] = newValue;				
            }
            else //QuangNN - 31/03/2010 Nhay tra mau o day
                if (oldHightLight && oldHightLight[i]) {
                var td = document.getElementById(symbol + '-' + i);
                if (td) {
                    td.style.backgroundColor = '';
					if (i == 2 || i == 4 || i == 6 || i == 8 || i == 10 || i == 16 || i == 18 || i == 20 || i == 22 || i == 24 || i==33 || i==35)
						td.style.color = getStateColor(prices[i - 1], stockInfo[1], stockInfo[2], stockInfo[3], i);
					else if (i == 0 || i == 11 || i == 12 || i == 13 || i == 14 || i == 27 || i == 28)
						td.style.color = getStateColor(prices[12], stockInfo[1], stockInfo[2], stockInfo[3], i);
					else if(i==1 || i==3 || i==5 || i==7 || i==9 || i==12 || i==15 || i==17 || i==19 || i==21 || i==23){
						var newColor = getStateColor(prices[i], stockInfo[1], stockInfo[2], stockInfo[3], i);
						td.style.color = newColor;
						var tdVol = document.getElementById(symbol + '-' + (i+1));
						tdVol.style.color = newColor;
					}
					else
						td.style.color = getStateColor(prices[i], stockInfo[1], stockInfo[2], stockInfo[3], i);
                }
            }
            oldHightLight[i] = hightlight[i];
            hightlight[i] = '';
        }
        Stock.processCount--;
        security.lastStatus = security.status;
        if (!security.lastTradeStatuses) security.lastTradeStatuses = [];
        for (var i in tradeStatuses) {
            security.lastTradeStatuses[i] = tradeStatuses[i];
        }
    },
    columnOrder: function(a, b) {
        var orderingColumn = AV.Options.orderingColumn, i;
        if (orderingColumn == 'Custom') {
            var symbols = AV.Options.showSymbols;
            if (symbols && symbols[Stock.floor]) {
                symbols = symbols[Stock.floor];
                if (symbols[a]) {
                    if (symbols[b]) {
                        i = symbols[a] - symbols[b];
                    }
                    else {
                        i = 1;
                    }
                }
                else {
                    if (symbols[b]) {
                        i = -1;
                    }
                    else {
                        i = (a > b) ? 1 : ((a == b) ? 0 : -1);
                    }
                }
            }
            else {
                i = 0; //(a > b)?1:((a == b)?0:-1);
            }
        }
        else if (orderingColumn > 0) {
            i = Stock.securities[a].prices[orderingColumn] - Stock.securities[b].prices[orderingColumn];
        }
        else if (orderingColumn == 0) {
            i = (a > b) ? 1 : ((a == b) ? 0 : -1);
        }
        else
            if (Stock.allSymbols[a] && Stock.allSymbols[b]) {
            i = Stock.allSymbols[a][-orderingColumn] - Stock.allSymbols[b][-orderingColumn];
        }
        else {
            i = 0;
        }
        i *= AV.Options.orderDir;
        if (i > 0) {
            return 1;
        }
        else
            if (i == 0) {
            return 0;
        }
        else {
            return -1;
        }
    },
    initEvents: function() {
        if (AV.App.symbolDraggable) {
            AV.load('3rdparty/jQuery/ui/ui.core.js', function() {
                AV.load('3rdparty/jQuery/ui/ui.sortable.js', '3rdparty/jQuery/ui/ui.draggable.js', function() {
                    $('.stockBoard tbody').sortable({
                        axis: 'y',
                        update: function(event, ui) {
                            // apply the new sort order to the original selectbox
                            delete AV.Options.showSymbols[Stock.floor];
                            AV.Options.showSymbols[Stock.floor] = {};
                            var i = 1;
                            $('.stockBoard tbody tr').each(function() {
                                var name = this.id.substr(2);
                                AV.Options.showSymbols[Stock.floor][name] = i++;
                            });
                            AV.Options.save();
                        }
                    });
                });
            });
        }
    },
    getChangePrice: function(price, arrow) {
        if (arrow) {
            return arrow + ((price < 10) ? '' : '') + (AV.App.absPrice ? '' : ((price > 0) ? '+' : ((price < 0) ? '-' : ''))) + Math.abs(price) + (((Math.abs(price).toString().indexOf('.') == -1)) ? '.0' : '');
        }
        return ((price < 10) ? ' ' : '') + (AV.App.absPrice == 1 ? '' : ((price > 0) ? '+' : ((price < 0) ? '-' : ' '))) + Math.abs(price) + (((Math.abs(price).toString().indexOf('.') == -1)) ? '.0' : '');
    }
});