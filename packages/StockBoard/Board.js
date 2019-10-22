Stock.Board = AV.extend(AV.Module, {
    refPrice: 0,
    g_cbb: '#111111',             // color background black - cac cot 3 gia mua/ban tot nhat
    g_cbg: '#313131',             // color background grey - cac cot lenh khop, tong kl, open, high, low...
    g_cbh: '#aaaaaa',             // color background hilight - nhay sang 1 s khi co update
    g_cbh2: '#777777',             // color background hilight 2 - nhay sang mo` 1s khi co update
    g_thbu: 300, 	            // time hilight before update (millisecond) - nhay sang 1 giay khi co update
    g_thau: 300,                 // time hilight after update (millisecond) - nhay mo` 1 giay khi co update
    floorName: 'HOSE',
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
            if (code.search('▲') !== -1) {
                //Neu dang la tang => giam
                AV.Options.save('orderDir', -1);
                code = code.replace(' ▲', '~');
            }
            //else if (code.search('▼') !== -1) {
            //    //Neu dang la giam => 0
            //    AV.Options.save('orderDir', 0);
            //    code = code.replace(' ▼', '');
            //}
            else {
                //Neu dang la 0 => tang
                AV.Options.save('orderDir', 1);
                code += '^';
            }
            obj.innerHTML = code;
            var html = obj.parentNode.parentNode.innerHTML.replace(' ▲', '').replace(' ▼', '').replace('~', ' ▼').replace('^', ' ▲');
            //if ($.browser.msie) {
            //    $(obj.parentNode.parentNode).html(html);
            //}
            //else {
                obj.parentNode.parentNode.innerHTML = html;
            //}

        }

        AV.Options.save('orderingColumn', column);

        Stock.orderedItems.sort(Stock.Board.prototype.columnOrder);

        for (var i = 0; i < Stock.orderedItems.length; i++) {
            if (Stock.allSymbols[Stock.orderedItems[i]]) {
                Stock.allSymbols[Stock.orderedItems[i]][5] = i;
            }
        }

        if (Stock.fixHeaderBlockDisplay === 'none') {
            $('#tableFixHeader>thead').html($('#sb-hd').html());
        }
        else {
            $('#sb-hd').html($('#tableFixHeader>thead').html());
        }

        Stock.isProccessing = true;

        var $selectedBoardData = $('#selectedBoardData'), $boardData = $('#boardData'), $hiddenBoardData = $('#hiddenBoardData');

        for (var i = 0, length = Stock.orderedItems.length; i < length; i++) {
            var symbol = Stock.orderedItems[i];
            if (!AV.Options.showSymbols[Stock.floor] || AV.Options.showSymbols[Stock.floor][symbol]) {
                var obj = $('#tr' + symbol);
                obj.parent().append(obj);
            }
        }

        if (AV.App.zebraTable) {
            $('.stockBoard>tbody>tr:even').removeClass('odd').addClass('even');
            $('.stockBoard>tbody>tr:odd').removeClass('even').addClass('odd');
        }

        Stock.isProccessing = false;
    },
    drawContent: function(i) {
        if (!i) {
            i = 0;
        }

        //Them cac ma trong ds theo doi len dau bang
        //var selectedCode = '', code = '', ie = $.browser.msie, end = parseInt(i) + 50;
        var selectedCode = '', code = '', end = parseInt(i) + 50;
        var count = 0;

        //Them cac ma theo doi o tren vao
        $.each(AV.Options.topSymbols, function(index, value) {
            var symbol = index + '';
            if (Stock.securities[symbol] && typeof (Stock.securities[symbol]) !== 'undefined') {
                //Kiem tra theo san o day
                var check = true;
                console.log(Stock.securities[symbol].prices[32]);
                if (location.href.indexOf('HOSE') >= 0 || location.href.indexOf('VN30INDEX') >= 0) {
                    if (Stock.securities[symbol].prices[32] != 100) check = false;
                } else if (location.href.indexOf('HASE') >= 0 || location.href.indexOf('HNX30INDEX') >= 0) {
                    if (Stock.securities[symbol].prices[32] != 2) check = false;
                } else if (location.href.indexOf('UPCOM') >= 0) {
                    if (Stock.securities[symbol].prices[32] != 3) check = false;
                }

                if (check) {
                    var trCode = Stock.board.drawRow(Stock.securities[symbol], count);
                    selectedCode += trCode;
                    count++;
                }
            }
        });

        $('#selectedBoardData').append(selectedCode);
        $.each(AV.Options.topSymbols, function(index, value) {
            var symbol = index + '';
            $('#chk' + symbol).attr('checked', 1);
        });

        if (selectedCode) {
            $('#selectedBoardData').show();
        }

        $('#boardData').append(code);
        if (end < Stock.orderedItems.length) {
            setTimeout(function() { Stock.board.drawContent(end); }, 300);
        }
        else {

            //if ($.browser.msie) {
            //    $('#boardData>tr:last').addClass('lastRow');
            //}

            //if (AV.App.zebraTable) {
            //    $('.stockBoard>tbody>tr:even').removeClass('odd').addClass('even');
            //    $('.stockBoard>tbody>tr:odd').removeClass('even').addClass('odd');
            //}

            Stock.contentReady = true;
            Stock.allowedPos = $("#stockBoard").height() - AV.Options.lineCount * AV.Options.lineHeight;
            if (typeof (ScrollTableObj) !== 'undefined') {
                ScrollTableObj.allowedPos = Stock.allowedPos;
            }
            Stock.updateElementsPosition();

            this.initEvents();
        }

    },
    drawRow: function(security, i) {

        var symbol = security.symbol;
        //if (!(!AV.Options.showSymbols[Stock.floor] || AV.Options.showSymbols[Stock.floor][symbol] || !Stock.allSymbols[symbol])) {
        //    return '';
        //}
        return AV.template('BoardRow',
			{
			    prices: security.prices,
			    stock: Stock.allSymbols[symbol],
			    tradeStatuses: security.tradeStatuses,
			    hightlight: security.hightlight,
			    map: AV.App.map[Stock.floor],
			    security: security,
			    symbol: symbol,
			    ie: false,
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
        $(obj).attr('style', 'background-color:#055a9a', 'important');
        $(obj).addClass('hightlight');
    },
    trOut: function(obj) {
        if (Stock.oldBgObj) {
            Stock.oldBgObj.style.backgroundColor = Stock.oldBgColor;
            $(obj).removeClass('hightlight');
            Stock.oldBgObj = false;
        }
    },
    chartClose: function() {
        $('#chart-region').css('display', 'none');
        clearInterval(AV.StockBoard.chartInterval);
    },
    chartOpen: function() {
        clearInterval(AV.StockBoard.chartInterval);

        $('#chart-region').css('display', 'block');

        Stock.board.initChartData();

        AV.StockBoard.chartInterval = setInterval(function() {
            Stock.board.updateChartData();
        }, 60000);
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
        //if(symbol == 'ACL')alert(hightlight[19]+' '+$.toJSON(hightlight));

        for (var j = 4, length = map.length; j < length; j++) {
            var i = map[j];
            //if(i == 1)alert(symbol);
            //if(symbol == 'ACL' && i == 19)alert(hightlight[i]);
            if (hightlight[i]) //QuangNN - 31/03/2010 Nhay mau o day
            {
                var td = document.getElementById(symbol + '-' + i);

                var nextTd = document.getElementById(symbol + '-' + (i + 1));
                if (!td) { continue; }
                var newClassName = tradeStatuses[i];
                var currentClassName = td.className;
                var checkClass = currentClassName.indexOf('greybg') >= 0 ? true : false;
                var newColor = AV.App.colors[checkClass ? 'other-' + newClassName : newClassName];
                var newColor1 = AV.App.colors[newClassName];

                if (i == 7) {
                    //var a = (prices[7] ? security.arrowIcon + ('' + prices[7]) : '');
                    if (prices[7] != '0' && prices[7] != '') {
                        var a = '<div style="float:right;width:12px;text-align:center;">' + security.arrowIcon + '</div><div style="float:right">' + Stock.board.getChangePrice(prices[7]) + '</div>';
                        Stock.board.UpdateCell(td, a, newColor, i);
                    }
                    else {
                        Stock.board.UpdateCell(td, '', newColor, i);
                    }
                    //console.log(symbol + '---' + i + '---' + a);
                }
                else if (i == 8) {
                    //Neu la thay doi gia thi doi mau ca ma CK
                    td.style.color = newColor;
                    var value = AV.numberFormat(prices[i]);
                    Stock.board.UpdateCell(td, value, newColor, i);

                    //Ma CK
                    document.getElementById(symbol + '-0').style.color = newColor1;
                    //KL du kien khop
                    if (document.getElementById(symbol + '-9'))
                        document.getElementById(symbol + '-9').style.color = newColor;

                    if (document.getElementById(symbol + '-7'))
                        document.getElementById(symbol + '-7').style.color = newColor;

                    document.getElementById(symbol + '-10').style.color = newColor;

                    /*
                    if (document.getElementById(symbol + '-20'))
                    document.getElementById(symbol + '-20').style.color = newColor1;

                    if (document.getElementById(symbol + '-21'))
                    document.getElementById(symbol + '-21').style.color = newColor1;
                    
                    if (document.getElementById(symbol + '-26'))
                    document.getElementById(symbol + '-26').style.color = newColor;
                    */
                }
                else if (i == 5 || i == 11) {
                    //Xu ly gia ATO, ATC
                    console.log(symbol + '--' + i + '--' + prices[i] + '--' + prices[i + 1]);
                    if (prices[i] == '0' || prices[i] == 'ATO' || prices[i] == 'ATC') {

                        Stock.board.UpdateCell(td, prices[i], '#FFF', i);
                        document.getElementById(symbol + '-' + (i + 1)).style.color = '#FFF';
                    } else {
                        Stock.board.UpdateCell(td, prices[i], newColor, i);
                    }
                }
                else if (i == 6 || i == 12) {
                    //Kiem tra xem gia co phai ATO, ATC ko
                    console.log(symbol + '--' + i + '--' + prices[i] + '--' + prices[i - 1]);
                    newValue = Stock.weightFormat(prices[i]);
                    if (prices[i - 1] == '0' || prices[i - 1] == 'ATO' || prices[i - 1] == 'ATC') {
                        Stock.board.UpdateCell(td, newValue, '#FFF', i);
                        document.getElementById(symbol + '-' + (i - 1)).style.color = '#FFF';
                    } else {
                        Stock.board.UpdateCell(td, newValue, newColor, i);
                    }
                }
                else {
                    var newValue = '';
                    if ((prices[i] && prices[i] != '0') || i == 7 || i == 32 || i == 33) {
                        if ((AV.App.volumnUnit == '10') && (i == 2 || i == 4 || i == 6 || i == 9 || i == 10 || i == 12 || i == 14 || i == 16 || i == 20 || i == 21 || i == 32 || i == 33 || i == 31 || i == 29)) {
                            newValue = Stock.weightFormat(prices[i]);
                        }
                        else {
                            newValue = AV.numberFormat(prices[i]);
                        }
                    }
                    else {
                        newValue = Stock.specialSymbols[3];
                    }
                    Stock.board.UpdateCell(td, newValue, newColor, i);
                }
            }

            security.oldHightLight[i] = security.hightlight[i];
            security.hightlight[i] = '';
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
        //if (AV.App.symbolDraggable) {
        //    AV.load('3rdparty/jQuery/ui/ui.core.js', function () {
        //        AV.load('3rdparty/jQuery/ui/ui.sortable.js', '3rdparty/jQuery/ui/ui.draggable.js', function () {
        //            $('.stockBoard tbody').sortable({
        //                axis: 'y',
        //                update: function (event, ui) {
        //                    // apply the new sort order to the original selectbox
        //                    delete AV.Options.showSymbols[Stock.floor];
        //                    AV.Options.showSymbols[Stock.floor] = {};
        //                    var i = 1;
        //                    $('.stockBoard tbody tr').each(function () {
        //                        var name = this.id.substr(2);
        //                        AV.Options.showSymbols[Stock.floor][name] = i++;
        //                    });
        //                    AV.Options.save();
        //                }
        //            });
        //        });
        //    });
        //}
    },
    getChangePrice: function(price, arrow) {
        if (price == 0 || parseFloat(price) == 0 || price == '0.0')
            return '0';
        if (arrow) {
            return arrow + ((price < 10) ? '' : '') + (AV.App.absPrice ? '' : ((price > 0) ? '+' : ((price < 0) ? '-' : ''))) + Math.abs(price) + (((Math.abs(price).toString().indexOf('.') == -1)) ? '.0' : '');
        }
        return ((price < 10) ? ' ' : '') + (AV.App.absPrice == 1 ? '' : ((price > 0) ? '+' : ((price < 0) ? '-' : ' '))) + Math.abs(price) + (((Math.abs(price).toString().indexOf('.') == -1)) ? '.0' : '');
    },
    initChartData: function() {
        var that = this;
        $("#tabs").tabs();
        // fix the classes
        $(".tabs-bottom .ui-tabs-nav, .tabs-bottom .ui-tabs-nav > *")
          .removeClass("ui-corner-all ui-corner-top")
          .addClass("ui-corner-bottom");
        // move the nav to the bottom
        $(".tabs-bottom .ui-tabs-nav").appendTo(".tabs-bottom");
        that.loadStaticData(AV.StockBoard.currentSymbol);
        that.loadChart(AV.StockBoard.currentSymbol, 'all');
        that.loadRealtimeChart(AV.StockBoard.currentSymbol, '1d');
        that.loadData(AV.StockBoard.currentSymbol);
        that.loadNews(AV.StockBoard.currentSymbol);
        $('#chart-week').css('backgroundImage', 'url(/ChartHandler.ashx?Type=4&Symbol=' + AV.StockBoard.currentSymbol + ')');

        //Neu ma do thuoc HNX thi load ra TopNPrice va Bang giao dich lo le
        setTimeout(function() {
            if (that.floorName == 'HNX') {
                $("#tabs").tabs('enable');
                //Top N Price
                //Bid
                that.loadTopPriceData('list-top-prices-bid', AV.StockBoard.currentSymbol, 'bid');
                //Offer
                that.loadTopPriceData('list-top-prices-offer', AV.StockBoard.currentSymbol, 'offer');

                //OddLot
                //Bid
                that.loadOddLotData('list-odd-lot-bid', AV.StockBoard.currentSymbol, 'bid');
                //Offer
                that.loadOddLotData('list-odd-lot-offer', AV.StockBoard.currentSymbol, 'offer');
            }
            else {
                $("#tabs").tabs("option", "disabled", [2, 3]);
            }
        }, 1000);
    },
    updateChartData: function() {
        var that = this;
        that.loadStaticData(AV.StockBoard.currentSymbol);
        //Load bieu do realtime
        that.loadRealtimeChart(AV.StockBoard.currentSymbol, '1d');
        //Load khoi luong Khop lenh lien tuc
        that.loadData(AV.StockBoard.currentSymbol);
        //Load tin tuc moi
        that.loadNews(AV.StockBoard.currentSymbol);
    },
    getHotNews: function() {
        //Lay tin moi nhat
        $.getJSON('http://vfpress.vn/vflastest/get?time=-1&callback=?', function(data) {
            $('#news>li').remove();
            $.each(data.data, function(index, value) {
                var str = '<li><a href="http://vfpress.vn/' + value.ArticlePath + '" target="_blank">' + value.Title + '</a></li>';
                $('#news').append(str);
            });

            $('#hot-news-content').vTicker();
        }
		);
    },
    bindNewClick: function() {
        var that = this;
        var tmp = jQuery('#list-news').find('tr');
        if (tmp.length > 0) {
            var newId = jQuery(tmp[1]).attr('id');
            var oldId = -1;
            if (that.rows != null && that.rows.length > 0) {
                oldId = $(that.rows[1]).attr('id');
            }

            if (newId !== oldId || that.rows.length !== tmp.length) {
                //console.log('bind news click');
                that.rows = jQuery('#list-news').find('tr');
                that.rows.bind('click', function(event) {
                    var id = $(this).attr('id');
                    //Load chi tiet tin
                    var content = '';
                    var title = '';
                    $.getJSON('/ChartHandler.ashx?Type=8&newsid=' + id + '&callback=?', function(data) {
                        if (data[0] !== 'undefined') {
                            content = data[0].Content;
                            title = data[0].Title;
                            $('#news-details').attr('title', title);
                            $('.ui-dialog-title').html(title);
                            $('#news-details').html(content);
                            $('#news-details').dialog({
                                width: 450,
                                height: 250,
                                maxWidth: 600,
                                maxHeight: 300
                            });
                        }
                    });
                });
            }
        }
    },
    loadNews: function(symbol) {
        $("#list-news").jqGrid({
            url: '/ChartHandler.ashx?Type=7&Symbol=' + symbol + '&callback=?',
            datatype: 'json',
            colNames: [AV.Lang.STT, AV.Lang.TIME, AV.Lang.TITLE],
            colModel: [
                { name: 'id', index: 'id', width: 30, align: "center", sorttype: "int" },
                { name: 'time', index: 'time', width: 120, align: "center", sorttype: "date" },
                { name: 'title', index: 'title', width: 620 }
            ],
            rowNum: 20,
            rowList: [20, 50, 100],
            pager: '#news-pager',
            jsonReader: {
                root: "rows",
                page: "page",
                total: "total",
                records: "records",
                cell: "row",
                id: "id"
            }
        }).navGrid('#news-pager', { edit: false, add: false, del: false });

        $("#list-news").setGridParam({ url: '/ChartHandler.ashx?Type=7&Symbol=' + symbol + '&callback=?' }).trigger("reloadGrid");
    },
    loadData: function(symbol) {
        var that = this;
        $("#list3").jqGrid({
            url: '/ChartHandler.ashx?Type=6&Symbol=' + symbol + '&callback=?',
            datatype: 'json',
            colNames: [AV.Lang.STT, AV.Lang.TIME, AV.Lang.PRICE, AV.Lang.DIFF, AV.Lang.TOTAL_VOLUMES],
            colModel: [
				{ name: 'id', index: 'id', width: 30, align: "center", sorttype: "int" },
				{ name: 'time', index: 'time', width: 70, align: "center", sorttype: "date" },
				{ name: 'price', index: 'price', width: 50, align: "right", sorttype: "float" },
				{ name: 'diff', index: 'diff', width: 50, align: "right", sorttype: "float" },
				{ name: 'vol', index: 'vol', width: 90, align: "right", sorttype: "float", formatter: "number", formatoptions: { decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 0, defaultValue: '0'} }
            ],
            rowNum: 50,
            rowList: [50, 100, 200],
            pager: '#pager3',
            jsonReader: {
                root: "rows",
                page: "page",
                total: "total",
                records: "records",
                cell: "row",
                id: "id"
            }
        }).navGrid('#pager3', { edit: false, add: false, del: false });

        $("#list3").setGridParam({ url: '/ChartHandler.ashx?Type=6&Symbol=' + symbol + '&callback=?' }).trigger("reloadGrid");

        //Boi mau
        setTimeout(function() {
            var basicPrice = parseFloat(that.refPrice) / 1000;
            $.each($('#list3 tr td'), function(key, value) {
                if (parseInt(key) != 0 && (parseInt(key) == 2 || parseInt(key) % 5 == 2)) {
                    var price = parseFloat(value.title);
                    if (price > 0) {
                        var color = '#000';
                        if (price < basicPrice)
                            color = '#FF0000';
                        else if (price > basicPrice)
                            color = '#0000FF';
                        $(this).closest('tr').css('color', color);
                    }
                }
            });
        }, 2000);
    },
    loadTopPriceData: function(divName, symbol, type) {
        var that = this;
        $('#' + divName).jqGrid({
            url: '/ChartHandler.ashx?Type=10&Symbol=' + symbol + '&TType=' + type + '&callback=?',
            datatype: 'json',
            colNames: [AV.Lang.STT, AV.Lang.PRICE, AV.Lang.DIFF, AV.Lang.TOTAL_VOLUMES],
            colModel: [
				{ name: 'id', index: 'id', width: 50, align: "center", sorttype: "int" },
				{ name: 'price', index: 'price', width: 80, align: "right", sorttype: "float" },
				{ name: 'diff', index: 'diff', width: 80, align: "right", sorttype: "float" },
				{ name: 'vol', index: 'vol', width: 150, align: "right", sorttype: "float", formatter: "number", formatoptions: { decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 0, defaultValue: '0'} }
            ],
            rowNum: 20,
            pgbuttons: false,     // disable page control like next, back button
            pgtext: null,         // disable pager text like 'Page 0 of 10'
            viewrecords: false,   // disable current view record text like 'View 1-10 of 100'
            jsonReader: {
                root: "rows",
                page: "page",
                total: "total",
                records: "records",
                cell: "row",
                id: "id"
            }
        });

        $('#' + divName).setGridParam({ url: '/ChartHandler.ashx?Type=10&Symbol=' + symbol + '&TType=' + type + '&callback=?' }).trigger("reloadGrid");

        //Boi mau
        setTimeout(function() {
            var basicPrice = parseFloat(that.refPrice) / 1000;
            var color = '#000';
            $.each($('#' + divName + ' tr td'), function(key, value) {
                if (parseInt(key) != 0 && (parseInt(key) == 1 || parseInt(key) % 4 == 1)) {
                    var price = parseFloat(value.title);
                    if (price > 0) {
                        if (price < basicPrice)
                            color = '#FF0000';
                        else if (price > basicPrice)
                            color = '#0000FF';
                        $(this).closest('tr').css('color', color);
                    }
                }
            });
        }, 2000);
    },
    loadOddLotData: function(divName, symbol, type) {
        var that = this;
        $('#' + divName).jqGrid({
            url: '/ChartHandler.ashx?Type=11&Symbol=' + symbol + '&TType=' + type + '&callback=?',
            datatype: 'json',
            colNames: [AV.Lang.STT, AV.Lang.PRICE, AV.Lang.DIFF, AV.Lang.TOTAL_VOLUMES],
            colModel: [
				{ name: 'id', index: 'id', width: 50, align: "center", sorttype: "int" },
				{ name: 'price', index: 'price', width: 80, align: "right", sorttype: "float" },
				{ name: 'diff', index: 'diff', width: 80, align: "right", sorttype: "float" },
				{ name: 'vol', index: 'vol', width: 150, align: "right", sorttype: "float", formatter: "number", formatoptions: { decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 0, defaultValue: '0'} }
            ],
            rowNum: 20,
            pgbuttons: false,     // disable page control like next, back button
            pgtext: null,         // disable pager text like 'Page 0 of 10'
            viewrecords: false,   // disable current view record text like 'View 1-10 of 100'
            jsonReader: {
                root: "rows",
                page: "page",
                total: "total",
                records: "records",
                cell: "row",
                id: "id"
            }
        });

        $('#' + divName).setGridParam({ url: '/ChartHandler.ashx?Type=11&Symbol=' + symbol + '&TType=' + type + '&callback=?' }).trigger("reloadGrid");

        //Boi mau
        setTimeout(function() {
            var basicPrice = parseFloat(that.refPrice) / 1000;
            var color = '#000';
            $.each($('#' + divName + ' tr td'), function(key, value) {
                if (parseInt(key) != 0 && (parseInt(key) == 1 || parseInt(key) % 4 == 1)) {
                    var price = parseFloat(value.title);
                    if (price > 0) {
                        if (price < basicPrice)
                            color = '#FF0000';
                        else if (price > basicPrice)
                            color = '#0000FF';
                        $(this).closest('tr').css('color', color);
                    }
                }
            });
        }, 2000);
    },
    loadRealtimeChart: function(symbol, range) {
        $.getJSON('/ChartHandler.ashx?Type=5&Symbol=' + symbol + '&Range=' + range + "&callback=?", function(data) {
            // split the data set into ohlc and volume
            var ohlc = [],
                volume = [],
                dataLength = data.length;

            for (i = 0; i < dataLength; i++) {
                ohlc.push([
                    data[i][0], // the date
                    data[i][4] // close
                ]);

                volume.push([
                    data[i][0], // the date
                    data[i][5] // the volume
                ])
            }
            //console.log(volume);
            // create the chart
            $('#chart-day').highcharts('StockChart', {
                rangeSelector: {
                    buttons: [{
                        type: 'hour',
                        count: 1,
                        text: '1h'
                    }, {
                        type: 'all',
                        count: 1,
                        text: 'All'
}],
                        selected: 1,
                        enabled: 1,
                        inputEnabled: false
                    },
                    scrollbar: {
                        enabled: false
                    },
                    navigator: {
                        enabled: false
                    },
                    title: {
                        margin: 0
                    },
                    exporting: {
                        enabled: false
                    },
                    credits: {
                        href: 'http://sbsc.com.vn',
                        text: 'sbsc.com.vn'
                    },

                    yAxis: [{
                        height: 120,
                        gridLineColor: '#FFF',
                        labels: { enabled: false }
                    }, {
                        top: 125,
                        height: 60,
                        labels: { enabled: false }
}],
                        xAxis: [{
                            labels: { enabled: false }
}],
                            series: [{
                                type: 'spline',
                                data: ohlc,
                                name: AV.StockBoard.currentSymbol,
                                tooltip: {
                                    valueDecimals: 1
                                }
                            }, {
                                type: 'column',
                                name: 'Volume',
                                data: volume,
                                yAxis: 1
}]
                            });
                        });
                    },
                    loadChart: function(symbol, range) {
                        $.getJSON('/ChartHandler.ashx?Type=5&Symbol=' + symbol + '&Range=' + range + "&callback=?", function(data) {
                            // split the data set into ohlc and volume
                            var ohlc = [],
                volume = [],
                dataLength = data.length;

                            for (i = 0; i < dataLength; i++) {
                                ohlc.push([
                    data[i][0], // the date
                    data[i][1], // open
                    data[i][2], // high
                    data[i][3], // low
                    data[i][4] // close
                ]);

                                volume.push([
                    data[i][0], // the date
                    data[i][5] // the volume
                ])
                            }
                            //console.log(volume);
                            // create the chart
                            $('#chart-full').highcharts('StockChart', {
                                rangeSelector: {
                                    selected: 1,
                                    enabled: 1,
                                    inputEnabled: false
                                },
                                scrollbar: {
                                    enabled: false
                                },
                                navigator: {
                                    enabled: false
                                },
                                title: {
                                    margin: 0
                                },
                                credits: {
                                    href: 'http://sbsc.com.vn',
                                    text: 'sbsc.com.vn'
                                },
                                yAxis: [{
                                    height: 150,
                                    gridLineColor: '#FFF',
                                    labels: { enabled: false }
                                }, {
                                    top: 125,
                                    height: 60,
                                    labels: { enabled: false }
}],
                                    xAxis: [{
                                        labels: { enabled: false }
}],
                                        series: [{
                                            type: 'candlestick',
                                            data: ohlc,
                                            name: AV.StockBoard.currentSymbol,
                                            tooltip: {
                                                valueDecimals: 1
                                            }
                                        }, {
                                            type: 'column',
                                            name: 'Volume',
                                            data: volume,
                                            yAxis: 1
}]
                                        });
                                    });
                                },
                                loadStaticData: function(symbol) {
                                    var that = this;
                                    $.getJSON('/ChartHandler.ashx?Type=9&Symbol=' + symbol + '&callback=?', function(data) {
                                        var obj = data[0];
                                        if (obj) {
                                            if (obj.Success == '1' || obj.Success == 1) {
                                                that.refPrice = parseFloat(obj.RefPrice);
                                                that.floorName = obj.FloorName;
                                                var ceilPrice = parseFloat(obj.CeilingPrice);
                                                var floorPrice = parseFloat(obj.FloorPrice);
                                                if (parseFloat(obj.CurrentPrice) == ceilPrice) {
                                                    $('#s-transan').html('CE');
                                                    document.getElementById('s-transan').style.color = '#0000ff';
                                                }
                                                else if (parseFloat(obj.CurrentPrice) == floorPrice) {
                                                    $('#s-transan').html('FL');
                                                    document.getElementById('s-transan').style.color = '#ff0000';
                                                }
                                                else
                                                    $('#s-transan').html('');
                                                $('#s-ma').html(obj.Symbol);
                                                $('#s-ten').html(obj.Name);
                                                $('#s-san').html(obj.FloorName);
                                                $('#s-nganh').html(obj.Sector);
                                                $('#s-giahientai').html(that.formatStaticData(Stock.weightFormat(obj.CurrentPrice)));
                                                if (obj.CurrentPrice != '0')
                                                    document.getElementById('s-thaydoi').style.color = document.getElementById('s-phantram').style.color = document.getElementById('s-giahientai').style.color = that.getStaticColor(obj.CurrentPrice, ceilPrice, floorPrice, that.refPrice, 0);
                                                $('#s-klgd').html(Stock.weightFormat(that.formatStaticData(obj.KLGD)));
                                                $('#s-giaduban').html(that.formatStaticData(Stock.weightFormat(obj.BG1)));
                                                if (obj.BG1 != '0')
                                                    document.getElementById('s-giaduban').style.color = that.getStaticColor(obj.BG1, ceilPrice, floorPrice, that.refPrice, 0);
                                                $('#s-giadumua').html(that.formatStaticData(Stock.weightFormat(obj.MG1)));
                                                if (obj.MG1 != '0')
                                                    document.getElementById('s-giadumua').style.color = that.getStaticColor(obj.MG1, ceilPrice, floorPrice, that.refPrice, 0);
                                                $('#s-giabq').html(that.formatStaticData(Stock.weightFormat(obj.GiaBQ)));
                                                if (obj.GiaBQ != '0')
                                                    document.getElementById('s-giabq').style.color = that.getStaticColor(obj.GiaBQ, ceilPrice, floorPrice, that.refPrice, 0);
                                                $('#s-giamc').html(that.formatStaticData(Stock.weightFormat(obj.GiaMC)));
                                                if (obj.GiaMC != '0')
                                                    document.getElementById('s-giamc').style.color = that.getStaticColor(obj.GiaMC, ceilPrice, floorPrice, that.refPrice, 0);
                                                $('#s-giacao').html(that.formatStaticData(Stock.weightFormat(obj.GiaCao)));
                                                if (obj.GiaCao != '0')
                                                    document.getElementById('s-giacao').style.color = that.getStaticColor(obj.GiaCao, ceilPrice, floorPrice, that.refPrice, 0);
                                                $('#s-giathap').html(that.formatStaticData(Stock.weightFormat(obj.GiaThap)));
                                                if (obj.GiaThap != '0')
                                                    document.getElementById('s-giathap').style.color = that.getStaticColor(obj.GiaThap, ceilPrice, floorPrice, that.refPrice, 0);
                                                $('#s-giatran').html(Stock.weightFormat(obj.CeilingPrice));
                                                $('#s-giasan').html(Stock.weightFormat(obj.FloorPrice));
                                                $('#s-nnmua').html(that.formatStaticData(Stock.weightFormat(obj.NNMua)));
                                                $('#s-nnban').html(that.formatStaticData(Stock.weightFormat(obj.NNBan)));

                                                var diff = obj.CurrentPrice > 0 ? obj.CurrentPrice - obj.RefPrice : 0;
                                                var diffPercent = obj.RefPrice > 0 ? (diff / obj.RefPrice) * 100 : 0;
                                                $('#s-thaydoi').html(AV.numberFormat(Stock.weightFormat(diff)));
                                                $('#s-phantram').html(AV.numberFormat(diffPercent) + '%');

                                                $('#s-klgd-homtruoc').html(Stock.weightFormat(obj.LastTotalShare));
                                                $('#s-tyle-gd').html(AV.numberFormat(obj.TyLeGD));
                                                $('#s-gtgd').html(Stock.weightFormat(parseFloat(obj.GTGD) / 1000000000));

                                                var timeCao = that.formatTime(obj.TimeCao);
                                                var timeThap = that.formatTime(obj.TimeThap);
                                                $('#s-tgcao').html(timeCao);
                                                $('#s-tgthap').html(timeThap);

                                                $('#s-giatc').html(that.formatStaticData(Stock.weightFormat(obj.RefPrice)));
                                                $('#s-bg3').html(that.formatStaticData(Stock.weightFormat(obj.BG3)));
                                                if (obj.BG3 != '0')
                                                    document.getElementById('s-bg3').style.color = document.getElementById('s-bkl3').style.color = that.getStaticColor(obj.BG3, ceilPrice, floorPrice, that.refPrice, 0);
                                                $('#s-bg2').html(that.formatStaticData(Stock.weightFormat(obj.BG2)));
                                                if (obj.BG2 != '0')
                                                    document.getElementById('s-bg2').style.color = document.getElementById('s-bkl2').style.color = that.getStaticColor(obj.BG2, ceilPrice, floorPrice, that.refPrice, 0);
                                                $('#s-bg1').html(that.formatStaticData(Stock.weightFormat(obj.BG1)));
                                                if (obj.BG1 != '0')
                                                    document.getElementById('s-bg1').style.color = document.getElementById('s-bkl1').style.color = that.getStaticColor(obj.BG1, ceilPrice, floorPrice, that.refPrice, 0);
                                                $('#s-bkl3').html(that.formatStaticData(Stock.weightFormat(obj.BKL3)));
                                                $('#s-bkl2').html(that.formatStaticData(Stock.weightFormat(obj.BKL2)));
                                                $('#s-bkl1').html(that.formatStaticData(Stock.weightFormat(obj.BKL1)));

                                                $('#s-mg3').html(that.formatStaticData(Stock.weightFormat(obj.MG3)));
                                                if (obj.MG3 != '0')
                                                    document.getElementById('s-mg3').style.color = document.getElementById('s-mkl3').style.color = that.getStaticColor(obj.MG3, ceilPrice, floorPrice, that.refPrice, 0);
                                                $('#s-mg2').html(that.formatStaticData(Stock.weightFormat(obj.MG2)));
                                                if (obj.MG2 != '0')
                                                    document.getElementById('s-mg2').style.color = document.getElementById('s-mkl2').style.color = that.getStaticColor(obj.MG2, ceilPrice, floorPrice, that.refPrice, 0);
                                                $('#s-mg1').html(that.formatStaticData(Stock.weightFormat(obj.MG1)));
                                                if (obj.MG1 != '0')
                                                    document.getElementById('s-mg1').style.color = document.getElementById('s-mkl1').style.color = that.getStaticColor(obj.MG1, ceilPrice, floorPrice, that.refPrice, 0);
                                                $('#s-mkl3').html(that.formatStaticData(Stock.weightFormat(obj.MKL3)));
                                                $('#s-mkl2').html(that.formatStaticData(Stock.weightFormat(obj.MKL2)));
                                                $('#s-mkl1').html(that.formatStaticData(Stock.weightFormat(obj.MKL1)));

                                                var tong_mua = parseFloat(obj.MKL3) + parseFloat(obj.MKL2) + parseFloat(obj.MKL1);
                                                var tong_ban = parseFloat(obj.BKL3) + parseFloat(obj.BKL2) + parseFloat(obj.BKL1);
                                                var chenh_lech = parseFloat(tong_mua) - parseFloat(tong_ban);

                                                $('#s-tong-mua').html(Stock.weightFormat(tong_mua));
                                                $('#s-tong-ban').html(Stock.weightFormat(tong_ban));
                                                $('#s-chenhlech').html(Stock.weightFormat(chenh_lech));

                                                $('#s-klmua').html(Stock.weightFormat(obj.KLMua));
                                                $('#s-klban').html(Stock.weightFormat(obj.KLBan));
                                                $('#s-slmua').html(Stock.weightFormat(obj.SLMua));
                                                $('#s-slban').html(Stock.weightFormat(obj.SLBan));

                                                return;
                                            }
                                            else {
                                                that.loadStaticData(symbol);
                                            }

                                            //Neu ma do thuoc HNX thi load ra TopNPrice va Bang giao dich lo le
                                            setTimeout(function() {
                                                if (that.floorName == 'HNX') {
                                                    $("#tabs").tabs('enable');
                                                    //Top N Price
                                                    //Bid
                                                    that.loadTopPriceData('list-top-prices-bid', AV.StockBoard.currentSymbol, 'bid');
                                                    //Offer
                                                    that.loadTopPriceData('list-top-prices-offer', AV.StockBoard.currentSymbol, 'offer');

                                                    //OddLot
                                                    //Bid
                                                    that.loadOddLotData('list-odd-lot-bid', AV.StockBoard.currentSymbol, 'bid');
                                                    //Offer
                                                    that.loadOddLotData('list-odd-lot-offer', AV.StockBoard.currentSymbol, 'offer');
                                                }
                                                else {
                                                    $("#tabs").tabs("option", "disabled", [3, 4]);
                                                }
                                            }, 1000);
                                        }
                                    });
                                },
                                formatTime: function(data) {
                                    if (data.indexOf(':') == -1) {
                                        var second = data.substr(data.length - 2, 2);
                                        var minute = data.substr(data.length - 4, 2);
                                        var hour = data.substr(0, data.length - 4);
                                        if (hour.length == 1) hour = '0' + '' + hour;
                                        data = hour + ':' + minute + ':' + second;
                                    }
                                    return data;
                                },
                                formatStaticData: function(data) {
                                    if (data == '0' || data == 0 || data == '' || data == ' ')
                                        return '&nbsp;';
                                    else if (data == '-1' || data == -1)
                                        return 'ATO';
                                    else if (data == '-2' || data == -2)
                                        return 'ATC';
                                    else
                                        return data;
                                },
                                getStaticColor: function(price, ceil, floor, basic, index) {
                                    if (price == 'ATC' || price == 'ATO' || parseFloat(price) == 0) {
                                        if (AV.App.ATOcolor)
                                            return AV.App.colors['ATOcolor'];
                                        else {
                                            if (index <= 7) return '#0000ff';
                                            else return '#ff0000';
                                        }
                                    }
                                    else if (price > 0) {
                                        if (Math.abs(price - basic) < 0.001) {
                                            return '#000';
                                        } else {
                                            if (price - basic > 0) {
                                                return '#0000ff';
                                            } else {
                                                return '#ff0000';
                                            }
                                        }
                                    }
                                },
                                // 1. update value + color
                                // 2. update color
                                // o-object (cell)
                                // v-value (price, qtty) if v=='0' => need clear cell value
                                // c-class name
                                // t-'b'-black background; 'g'-grey background
                                // i-position of data
                                UpdateCell: function(obj, value, colorName, i) {
                                    var that = this;
                                    if (!obj) return false;
                                    if (value == '') return false;
                                    if ((value == 'ATO' || value == 'ATC') && obj.innerHTML == value) return false;
                                    if ((value == '0') && obj.innerHTML == '') return false;
                                    var bg = (i == 7 || i == 8 || i == 9 || i == 10 || i == 18 || i == 19) ? that.g_cbg : that.g_cbb;
                                    if (obj.innerHTML == value) return false;

                                    obj.style.backgroundColor = that.g_cbh;

                                    setTimeout(function() {
                                        //Set value
                                        if (value != 'z') {
                                            obj.innerHTML = value;
                                        }
                                        //Set color
                                        if (value == 'ATO' || value == 'ATC') obj.style.color = '#FFF';
                                        else if (colorName != '')
                                            obj.style.color = colorName;

                                        //Set background
                                        obj.style.backgroundColor = that.g_cbh2;

                                        setTimeout(function() {
                                            //Change back background
                                            obj.style.backgroundColor = '';
                                        }, that.g_thau)
                                    }, that.g_thbu);
                                },
                                hideChart: function() {
                                    var display = $('#chart-block').css('display');
                                    if (display != 'none') {
                                        display = 'none';
                                        $('#hide-chart').text(Lang.SHOW_CHART);
                                        AV.Options.save('showChart', false);
                                    }
                                    else {
                                        display = '';
                                        $('#hide-chart').text(Lang.HIDE_CHART);
                                        AV.Options.save('showChart', true);
                                    }

                                    $('#chart-block').css('display', display);
                                },
                                hideIndexes: function() {
                                    var display = $('#info-stock').css('display');
                                    if (display != 'none') {
                                        display = 'none';
                                        $('#hide-indexes').text(Lang.SHOW_FULL_INDEXES);
                                        AV.Options.save('showRawIndexes', false);
                                    }
                                    else {
                                        display = '';
                                        $('#hide-indexes').text(Lang.HIDE_FULL_INDEXES);
                                        AV.Options.save('showRawIndexes', true);
                                    }

                                    $('#info-stock').css('display', display);
                                },
                                checkTopSymbols: function(symbol) {
                                    var result = 0;
                                    $.each(AV.Options.topSymbols, function(index, value) {
                                        if (result == 0) {
                                            if (symbol.toString() == index.toString()) {
                                                result = 1;
                                            }
                                        }
                                    });

                                    return result;
                                }
                            });
