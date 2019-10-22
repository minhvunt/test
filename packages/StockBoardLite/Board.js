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
            //if ($.browser.msie) {
            //    $(obj.parentNode.parentNode).html(html);
            //}
            //else {
                obj.parentNode.parentNode.innerHTML = html;
            //}

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
                var obj = $('#tr' + symbol);
                obj.parent().append(obj);
            }
        }
        /*if(AV.App.zebraTable)
        {
        $('.stockBoard>tbody>tr:even').removeClass('odd').addClass('even');
        $('.stockBoard>tbody>tr:odd').removeClass('even').addClass('odd');
        }*/
        Stock.isProccessing = false;
    },
    drawContent: function(i) {
        if (!i) {
            i = 0;
        }

        //var selectedCode = '', code = '', ie = $.browser.msie, end = parseInt(i) + 20;
        var selectedCode = '', code = '', ie = false, end = parseInt(i) + 20;

        for (var length = Stock.orderedItems.length; i < length && i < end; i++)
            if (Stock.securities[Stock.orderedItems[i]]) {
            var symbol = Stock.securities[Stock.orderedItems[i]].symbol;
            if (AV.Options.showSymbols[Stock.floor][symbol]) {
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
            //if ($.browser.msie) {
            //    $('#selectedBoardData>tr:last').addClass('lastRow');
            //}
            if (AV.App.zebraTable) {
                $('.stockBoard>tbody>tr:even').removeClass('odd').addClass('even');
                $('.stockBoard>tbody>tr:odd').removeClass('even').addClass('odd');
            }
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
        /*
        if(AV.App.hightlightColor == 'revert')
        {
        if(td.style.color != 'white')
        {
        td.style.backgroundColor = td.style.color;
        td.style.color = 'black';
        }
        }
        else
        {*/
        var temp = AV.App.disableHighlight;
        if (temp) {
            if (temp.indexOf(',' + i + ',') == -1) {
                var bgColor = AV.App.hightlightColor;
                if (bgColor == '1color')
                    bgColor = '#f0ff00';
                td.style.backgroundColor = bgColor;
                td.style.color = AV.App.texthightlightColor ? AV.App.texthightlightColor : '';
                /*
                if(AV.App.changeColor == 'priceOnly' && i != 7)
                {
                td.style.color = 'black';
                }
                */
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

        if (security.lastStatus != security.status && AV.App.boardStyle != 'MULTICOLOR' && (AV.App.changeColor != 'priceOnly')) {
            var td = document.getElementById(symbol + '-0');
            //if (td) td.style.color = AV.App.colors[security.status];
            var temp = AV.App.highlightwithStatus;
            if (temp) {
                var h = temp.split(',');
                for (var k = 0, length = h.length; k < length; k++) {
                    if (h[k] != '') {
                        var td = document.getElementById(symbol + '-' + h[k]);
                        if (td) {
                            if (AV.App.disableHighlight) {
                                if (AV.App.disableHighlight.indexOf(',' + h[k] + ',') < 0)
                                    td.style.color = AV.App.colors[security.status];
                                else
                                    td.style.color = AV.App.colors['other-' + security.status];
                            }
                            else
                                td.style.color = AV.App.colors[security.status];
                        }
                    }
                }
            }
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
                if (!td) { continue; }
                if (AV.App.boardStyle == 'MULTICOLOR') //QuangNN - 31/03/2010 Bang nay la nhay nhieu mau giong TSS
                {
                    if (i < 7 || i > 10) {
                        if ((stock.visibleRow <= stockInfo[5] && stock.visibleRow > stockInfo[5] - ((AV.clientHeight() / 25 + 5)))
							|| (!AV.Options.showSymbols[Stock.floor] || AV.Options.showSymbols[Stock.floor][symbol])) {
                            td.style.backgroundColor = (tradeStatuses[i] == 'ss-ceil' || tradeStatuses[i] == 'ss-up') ? '#56B5FA' : '#FF8080';
                            //td.className = td.className + ' hightlight';
                        }
                    }
                    else {
                        var newClassName = tradeStatuses[i];
                        if (newClassName && (!security.lastTradeStatus || newClassName != security.lastTradeStatus[i])) {
                            td.style.color = AV.App.colors[newClassName];
                            if (i == 7) {
                                td.nextSibling.nextSibling.style.color = td.nextSibling.style.color = td.previousSibling.style.color = AV.App.colors[newClassName];
                            }
                        }
                    }
                    if (i == 7) {
                        td.firstChild.nextSibling.innerHTML = security.arrowIcon;
                        document.getElementById(symbol + '-0').firstChild.nextSibling.innerHTML = security.arrowIcon;
                        td.firstChild.nextSibling.nextSibling[AV.innerText] = Stock.board.getChangePrice(prices[7]);
                        td.firstChild[AV.innerText] = (security.status == 'ss-ceil') ? 'CE' : ((security.status == 'ss-floor') ? 'FL' : ' ');
                    }
                    else {

                        var value = (((prices[i] && prices[i] != '0') || (i % 2 == 1 && i != 7 && i != 9 && i < 17 && (prices[parseInt(i) + 1] > 0 || (!AV.App.showZeroPrice && (i == 5 || i == 11))))) ? (((AV.App.volumnUnit == '10') && (i == 2 || i == 4 || i == 6 || i == 9 || i == 10 || i == 12 || i == 14 || i == 16 || i == 20 || i == 21 || i == 32 || i == 33 || i == 31 || i == 29)) ? Stock.weightFormat(prices[i]) : AV.numberFormat(prices[i])) : Stock.specialSymbols[3]);
                        td.innerHTML = value;
                    }
                }
                else {
                    var newClassName = tradeStatuses[i];
                    if (AV.App.hightlightColor == 'revert') //QuangNN - 31/03/2010 - Day la doan nhay dao? mau (TSS)
                    {
                        var color = td.style.backgroundColor;
                        if (color) {
                            td.style.color = color;
                            td.style.backgroundColor = '';
                        }
                    }
                    var newColor = AV.App.colors[newClassName];
                    if (AV.App.boardType && AV.App.boardType == 'AGS') {
                        newColor = '#000';
                    }
                    //else
                    if (AV.App.hightlightColor == '1color') {
                        if (newClassName && (!security.lastTradeStatus || newClassName != security.lastTradeStatus[i])) {
                            if ((i == 2 || i == 4 || i == 6 || i == 12 || i == 14 || i == 16) && (prices[i - 1] == 'ATO' || prices[i - 1] == 'ATC' || prices[i - 1] == '' || prices[i - 1] == 0) && (prices[i] == 0 || prices[i] == '')) {
                                //&& !oldHightLight[i-1]
                                td.previousSibling[AV.innerText] = '';
                            }
                        }
                    }
                    else {
                        //if (AV.path.indexOf('AGS') != -1 && (newClassName == 'ss-ceil' || newClassName == 'ss-up') && i == 7) newColor = '#0000FF'; //QuangNN - Nhay mau cua AGS
                        if (newClassName && (!security.lastTradeStatus || newClassName != security.lastTradeStatus[i])) {

                            if (i != 20 && i != 21) //QuangNN - 31/03/2010 # NN mua ban
                            {
                                if (AV.App.ATOcolor && (prices[i] == 'ATC' || prices[i] == 'ATO' || prices[i - 1] == 'ATC' || prices[i - 1] == 'ATO')) {
                                    td.style.color = AV.App.ATOcolor;
                                }
                                if (AV.App.changeColor != 'priceOnly'/* || i == 8 || i == 7*/) {
                                    td.style.color = newColor;
                                }
                            }
                            // && ! hightlight[parseInt(i)+1]
                            if ((i == 1 || i == 3 || i == 5 || i == 8 || i == 11 || i == 13 || i == 15) && AV.Options.volColor) {
                                if (AV.App.changeColor != 'priceOnly') {
                                    if (AV.App.hightlightColor == 'revert') {
                                        var color = td.nextSibling.style.backgroundColor;
                                        if (color) {
                                            td.nextSibling.style.color = color;
                                            td.nextSibling.style.backgroundColor = '';
                                        }
                                    }
                                    else {
                                        if (AV.App.ATOcolor && (prices[i] == 'ATC' || prices[i] == 'ATO')) {
                                            td.nextSibling.style.color = AV.App.ATOcolor;
                                        }
                                        else {
                                            td.nextSibling.style.color = newColor;
                                        }
                                    }
                                }
                            }


                            if ((i == 2 || i == 4 || i == 6 || i == 12 || i == 14 || i == 16) && (prices[i - 1] == 'ATO' || prices[i - 1] == 'ATC' || prices[i - 1] == '' || prices[i - 1] == 0) && (prices[i] == 0 || prices[i] == '')) {
                                //&& !oldHightLight[i-1]
                                td.previousSibling[AV.innerText] = '';
                            }
                            /*
                            if(i == 8 && (AV.App.changeColor != 'priceOnly'))
                            {
                            if(!hightlight[parseInt(i)+2]){
                            if(AV.App.hightlightColor == 'revert')
                            {
                            var color = td.nextSibling.nextSibling.style.backgroundColor;
                            if(color)
                            {
                            td.nextSibling.nextSibling.style.color = color;
                            td.nextSibling.nextSibling.style.backgroundColor = '';
                            }
                            }
                            td.nextSibling.nextSibling.style.color = newColor;
                            }
                            if(!oldHightLight[i-1]){
                            //td.previousSibling.style.color = AV.App.colors[newClassName];
                            }
                            }
                            */
                        }
                    }
                    //if(className.indexOf('hightlight') == -1)

                    if (AV.Options.tableType[Stock.floor] != 'infinite') {
                        /*if((stock.visibleRow <= stockInfo[5] && stock.visibleRow > stockInfo[5] - ((AV.clientHeight()/25+5)))
                        || (!AV.Options.showSymbols[Stock.floor] || AV.Options.showSymbols[Stock.floor][symbol]))*/
                        {

                            Stock.board.changeTdColor(td, i);

                            //td.className = td.className + ' hightlight';
                        }
                    }
                    else if (!td.isHidden) {
                        Stock.board.changeTdColor(td, i);
                    }

                    if (i == 7) {
                        //						alert(td.firstChild.nextSibling[AV.innerText]);exit;
                        //alert(security.arrowIcon.length);exit;
                        var a = (AV.App.CEFL ? (security.status == 'ss-ceil') ? 'CE' : ((security.status == 'ss-floor') ? 'FL' : ' ') : '') + (prices[7] ? security.arrowIcon + (AV.App.rubsePriceStyle ? Stock.board.getChangePrice(prices[7]) : ('' + (AV.App.absPrice ? Math.abs(prices[7]) : prices[7]))) : '');
                        td[(security.arrowIcon.length < 10) ? AV.innerText : 'innerHTML'] = a;
                        if (!AV.App.disableHighlight)
                            if (td.firstChild)
                            if (td.firstChild.nextSibling)
                            td.firstChild.nextSibling[(security.arrowIcon.length < 10) ? AV.innerText : 'innerHTML'] = a;

                        //alert(td.firstChild.nextSibling['innerHTML']);exit;
                    }
                    else {
                        /*var value = stock.specialSymbols[3];
                        if(Math.round(prices[i])>0)
                        {
                        value = ((AV.App.volumnUnit == '10') && (i == 2 || i == 4 || i == 6 || i == 9 || i == 10 || i == 12 || i == 14 || i == 16 || i == 20 || i == 21))?Stock.weightFormat(prices[i]):AV.numberFormat(prices[i]);
                        }
                        else if((i == 1 || i == 3 || i == 13 || i == 15) && prices[i+1]>0)
                        {
                        value = 0;
                        }*/
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
                        //var value = (((prices[i] && prices[i]!='0') || (i % 2 == 1 && i!=7 && i!= 9 && i< 17 && (prices[parseInt(i)+1]>0 || (!AV.App.showZeroPrice && (i==5 || i==11)))))?(((AV.App.volumnUnit == '10') && (i == 2 || i == 4 || i == 6 || i == 9 || i == 10 || i == 12 || i == 14 || i == 16 || i == 20 || i == 21))?Stock.weightFormat(prices[i]):AV.numberFormat(prices[i])):Stock.specialSymbols[3]);
                        td[AV.innerText] = newValue;
                    }
                }
                /*if(Stock.floor == 'UPCOM' && (i == 1 || i == 3 || i == 5 || i == 11 || i == 13 || i == 15))
                {
                td = document.getElementById(symbol+'-'+(parseInt(i)+1));
                td.title = symbol + ' test - '+ Lang.price + ': '+AV.numberFormat(prices[i]);
                }*/
            }
            else //QuangNN - 31/03/2010 Nhay tra mau o day
                if (oldHightLight && oldHightLight[i]) {
                var td = document.getElementById(symbol + '-' + i);
                //if(td.style.backgroundColor != 'transparent')
                if (td) {
                    if (AV.App.hightlightColor == 'revert') //QuangNN 31/3/2010 - Neu la nhay mau nguoc (TSS)
                    {
                        var color = td.style.backgroundColor;
                        if (color) {
                            td.style.color = color;
                            td.style.backgroundColor = '';
                        }
                    }
                    else if (AV.App.boardType && AV.App.boardType == 'AGS') {
                        td.removeAttribute('style');
                        if (i == 6 || i == 12) {
                            if (AV.App.ATOcolor && (prices[i - 1] == 'ATC' || prices[i - 1] == 'ATO' || prices[i - 1] == 0)) {
                                td.style.color = AV.App.ATOcolor;
                            }
                        }
                        else if (i == 5 || i == 11) {
                            if (AV.App.ATOcolor && (prices[i] == 'ATC' || prices[i] == 'ATO')) {
                                td.style.color = AV.App.ATOcolor;
                            }
                        }
                        else if (i == 7) {
                            td.style.color = getStateColor(prices[8], stockInfo[1], stockInfo[2], stockInfo[3], i);
                        }
                        else if (i == 8 || i == 10)
                            td.style.color = '#000';
                        else
                            td.style.color = '#FFFF00';
                    }
                    else {
                        //						alert('hehe');exit;
                        td.style.backgroundColor = '';
                        if (AV.App.changeColor == 'priceOnly' && i != 7 && i != 8 && i != 9 && i != 10) {
                            td.style.color = '#ffff00';
                        }
                        else if (AV.App.hightlightColor == '1color') //QuangNN 31/3/2010 Neu la nhay mau 1 kieu nhu SBSC
                        {
                            if (i == 6 || i == 12) {
                                if (AV.App.ATOcolor && (prices[i - 1] == 'ATC' || prices[i - 1] == 'ATO' || prices[i - 1] == 0)) {
                                    td.style.color = AV.App.ATOcolor;
                                }
                                else {
                                    td.style.color = getStateColor(prices[i - 1], stockInfo[1], stockInfo[2], stockInfo[3], i);
                                }
                            }
                            else if (i == 5 || i == 11) {
                                if (AV.App.ATOcolor && (prices[i] == 'ATC' || prices[i] == 'ATO')) {
                                    td.style.color = AV.App.ATOcolor;
                                }
                                else {
                                    td.style.color = getStateColor(prices[i], stockInfo[1], stockInfo[2], stockInfo[3], i);
                                }
                            }
                            else {
                                //Rieng voi SBSC thi cac cot highlight nhay mau khac so voi cac cot con lai
                                var temp = AV.App.disableHighlight;
                                if (temp) {
                                    if (temp.indexOf(',' + i + ',') != -1) {

                                        if (i == 7 || i == 8 || i == 9 || i == 10) {
                                            td.style.color = getOtherStateColor(prices[8], stockInfo[1], stockInfo[2], stockInfo[3], i);
                                        }
                                        else if (Stock.floor == 'HO') {
                                            if (i == 29 || i == 31)
                                                td.style.color = getOtherStateColor(prices[i - 1], stockInfo[1], stockInfo[2], stockInfo[3], i);
                                            else
                                                td.style.color = getOtherStateColor(prices[i], stockInfo[1], stockInfo[2], stockInfo[3], i);
                                        }
                                    }
                                    else {
                                        if (i == 29 || i == 31 || i == 2 || i == 4 || i == 6 || i == 12 || i == 14 || i == 16)
                                            td.style.color = getStateColor(prices[i - 1], stockInfo[1], stockInfo[2], stockInfo[3], i);
                                        else if (i == 0 || i == 7 || i == 8 || i == 9 || i == 10 || i == 27 || i == 20 || i == 21)
                                            td.style.color = getStateColor(prices[8], stockInfo[1], stockInfo[2], stockInfo[3], i);
                                        else if (i == 32 || i == 33)
                                            td.style.color = AV.App.blackColor;
                                        else
                                            td.style.color = getStateColor(prices[i], stockInfo[1], stockInfo[2], stockInfo[3], i);
                                    }
                                }
                                else {
                                    if (i == 29 || i == 31 || i == 2 || i == 4 || i == 6 || i == 12 || i == 14 || i == 16)
                                        td.style.color = getStateColor(prices[i - 1], stockInfo[1], stockInfo[2], stockInfo[3], i);
                                    else if (i == 0 || i == 7 || i == 8 || i == 9 || i == 10 || i == 27 || i == 20 || i == 21)
                                        td.style.color = getStateColor(prices[8], stockInfo[1], stockInfo[2], stockInfo[3], i);
                                    else if (i == 32 || i == 33)
                                        td.style.color = AV.App.blackColor;
                                    else
                                        td.style.color = getStateColor(prices[i], stockInfo[1], stockInfo[2], stockInfo[3], i);
                                }
                            }
                        }
                        else {
                            td.style.backgroundColor = ''; //QuangNN 31/3/2010 Neu chi nhay mau thi chi can chuyen lai bg la xong
                            if (i == 29 || i == 31 || i == 2 || i == 4 || i == 6 || i == 12 || i == 14 || i == 16)
                                td.style.color = getStateColor(prices[i - 1], stockInfo[1], stockInfo[2], stockInfo[3], i);
                            else if (i == 0 || i == 7 || i == 8 || i == 9 || i == 10 || i == 27 || i == 20 || i == 21)
                                td.style.color = getStateColor(prices[8], stockInfo[1], stockInfo[2], stockInfo[3], i);
                            else if (i == 32 || i == 33)
                                td.style.color = AV.App.blackColor;
                            else
                                td.style.color = getStateColor(prices[i], stockInfo[1], stockInfo[2], stockInfo[3], i);
                        }
                    }
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
    updateRowWithCol: function(security, col) {
        var symbol = security.symbol, stock = Stock, stockInfo = stock.allSymbols[symbol];
        /*
        if(!(!AV.Options.showSymbols[stock.floor] || AV.Options.showSymbols[stock.floor][symbol])){			
        Stock.processCount--;
        return;
        }
        */
        var prices = security.prices,
			tradeStatuses = security.tradeStatuses,
			hightlight = security.hightlight,
			oldHightLight = security.oldHightLight;
        if (!oldHightLight) {
            oldHightLight = security.oldHightLight = [];
        }

        if (security.lastStatus != security.status && AV.App.boardStyle != 'MULTICOLOR' && (AV.App.changeColor != 'priceOnly')) {
            if (col == 0 || col == 7 || col == 8 || col == 10 || col == 20 || col == 9) {
                var td = document.getElementById(symbol + '-' + col);
                if (td) td.style.color = AV.App.colors[security.status];
            }
            /*
            var td = document.getElementById(symbol+'-20');
            if(td) td.style.color = AV.App.colors[security.status];
            if(AV.App.hightlightColor != 'revert')
            {
            var td = document.getElementById(symbol+'-9');
            if(td) td.style.color = AV.App.colors[security.status];
            var td = document.getElementById(symbol+'-10');
            if(td) td.style.color = AV.App.colors[security.status];
            }
            if(stock.floor == 'HA')
            {
            var td = document.getElementById(symbol+'-21');
            if(td) td.style.color = AV.App.colors[security.status];
            }
            */
        }
        var map = AV.App.map[stock.floor];
        //if(symbol == 'ACL')alert(hightlight[19]+' '+$.toJSON(hightlight));

        /*for(var j = 4, length = map.length; j < length; j++)
        {*/
        var i = col;
        //if(i == 1)alert(symbol);
        //if(symbol == 'ACL' && i == 19)alert(hightlight[i]);
        if (hightlight[i]) {
            var td = document.getElementById(symbol + '-' + i);
            if (!td) { return; }
            if (AV.App.boardStyle == 'MULTICOLOR') {
                if (i < 7 || i > 10) {
                    if ((stock.visibleRow <= stockInfo[5] && stock.visibleRow > stockInfo[5] - ((AV.clientHeight() / 25 + 5)))
							|| (!AV.Options.showSymbols[Stock.floor] || AV.Options.showSymbols[Stock.floor][symbol])) {
                        td.style.backgroundColor = (tradeStatuses[i] == 'ss-ceil' || tradeStatuses[i] == 'ss-up') ? '#56B5FA' : '#FF8080';
                        //td.className = td.className + ' hightlight';
                    }
                }
                else {
                    var newClassName = tradeStatuses[i];
                    if (newClassName && (!security.lastTradeStatus || newClassName != security.lastTradeStatus[i])) {
                        td.style.color = AV.App.colors[newClassName];
                        if (i == 7) {
                            td.nextSibling.nextSibling.style.color = td.nextSibling.style.color = td.previousSibling.style.color = AV.App.colors[newClassName];
                        }
                    }
                }
                if (i == 7) {
                    td.firstChild.nextSibling.innerHTML = security.arrowIcon;
                    document.getElementById(symbol + '-0').firstChild.nextSibling.innerHTML = security.arrowIcon;
                    td.firstChild.nextSibling.nextSibling[AV.innerText] = Stock.board.getChangePrice(prices[7]);
                    td.firstChild[AV.innerText] = (security.status == 'ss-ceil') ? 'CE' : ((security.status == 'ss-floor') ? 'FL' : ' ');
                }
                else {

                    var value = (((prices[i] && prices[i] != '0') || (i % 2 == 1 && i != 7 && i != 9 && i < 17 && (prices[parseInt(i) + 1] > 0 || (!AV.App.showZeroPrice && (i == 5 || i == 11))))) ? (((AV.App.volumnUnit == '10') && (i == 2 || i == 4 || i == 6 || i == 9 || i == 10 || i == 12 || i == 14 || i == 16 || i == 20 || i == 21 || i == 32 || i == 33 || i == 31 || i == 29)) ? Stock.weightFormat(prices[i]) : AV.numberFormat(prices[i])) : Stock.specialSymbols[3]);
                    td.innerHTML = value;
                }
            }
            else {
                var newClassName = tradeStatuses[i];
                if (AV.App.hightlightColor == 'revert') {
                    var color = td.style.backgroundColor;
                    if (color) {
                        td.style.color = color;
                        td.style.backgroundColor = '';
                    }
                }
                var newColor = AV.App.colors[newClassName];
                if (AV.path.indexOf('AGS') != -1 && (newClassName == 'ss-ceil' || newClassName == 'ss-up') && i == 7) newColor = '#0000FF';
                if (newClassName && (!security.lastTradeStatus || newClassName != security.lastTradeStatus[i])) {

                    if (i != 20 && i != 21) {

                        if (AV.App.ATOcolor && (prices[i] == 'ATC' || prices[i] == 'ATO' || prices[i - 1] == 'ATC' || prices[i - 1] == 'ATO')) {
                            td.style.color = AV.App.ATOcolor;
                        }
                        else
                            if (AV.App.changeColor != 'priceOnly' || (i == 8) || (i == 7)) {
                            td.style.color = newColor;
                        }
                    }
                    // && ! hightlight[parseInt(i)+1]
                    if ((i == 1 || i == 3 || i == 5 || i == 8 || i == 11 || i == 13 || i == 15) && AV.Options.volColor) {
                        if (AV.App.changeColor != 'priceOnly') {
                            if (AV.App.hightlightColor == 'revert') {
                                var color = td.nextSibling.style.backgroundColor;
                                if (color) {
                                    td.nextSibling.style.color = color;
                                    td.nextSibling.style.backgroundColor = '';
                                }
                            }
                            else {
                                if (AV.App.ATOcolor && (prices[i] == 'ATC' || prices[i] == 'ATO')) {
                                    td.nextSibling.style.color = AV.App.ATOcolor;
                                }
                                else {
                                    td.nextSibling.style.color = newColor;
                                }
                            }
                        }
                    }


                    if ((i == 2 || i == 4 || i == 6 || i == 12 || i == 14 || i == 16) && (prices[i - 1] == 'ATO' || prices[i - 1] == 'ATC' || prices[i - 1] == '' || prices[i - 1] == 0) && (prices[i] == 0 || prices[i] == '')) {
                        //&& !oldHightLight[i-1]
                        td.previousSibling[AV.innerText] = '';
                    }
                    /*
                    if(i == 8 && (AV.App.changeColor != 'priceOnly'))
                    {
                    if(!hightlight[parseInt(i)+2]){
                    if(AV.App.hightlightColor == 'revert')
                    {
                    var color = td.nextSibling.nextSibling.style.backgroundColor;
                    if(color)
                    {
                    td.nextSibling.nextSibling.style.color = color;
                    td.nextSibling.nextSibling.style.backgroundColor = '';
                    }
                    }
                    td.nextSibling.nextSibling.style.color = newColor;
                    }
                    if(!oldHightLight[i-1]){
                    td.previousSibling.style.color = AV.App.colors[newClassName];
                    }
                    }
                    */
                }
                //if(className.indexOf('hightlight') == -1)

                if (AV.Options.tableType[Stock.floor] != 'infinite') {
                    /*if((stock.visibleRow <= stockInfo[5] && stock.visibleRow > stockInfo[5] - ((AV.clientHeight()/25+5)))
                    || (!AV.Options.showSymbols[Stock.floor] || AV.Options.showSymbols[Stock.floor][symbol]))*/
                    {

                        Stock.board.changeTdColor(td, i);

                        //td.className = td.className + ' hightlight';
                    }
                }
                else if (!td.isHidden) {
                    Stock.board.changeTdColor(td, i);
                }

                if (i == 7) {
                    //						alert(td.firstChild.nextSibling[AV.innerText]);exit;
                    td.firstChild.nextSibling[(security.arrowIcon.length < 10) ? AV.innerText : 'innerHTML'] = (AV.App.CEFL ? (security.status == 'ss-ceil') ? 'CE' : ((security.status == 'ss-floor') ? 'FL' : ' ') : '') + (prices[7] ? security.arrowIcon + '' + (AV.App.rubsePriceStyle ? Stock.board.getChangePrice(prices[7]) : ('' + (AV.App.absPrice ? Math.abs(prices[7]) : prices[7]))) : '');
                }
                else {
                    /*var value = stock.specialSymbols[3];
                    if(Math.round(prices[i])>0)
                    {
                    value = ((AV.App.volumnUnit == '10') && (i == 2 || i == 4 || i == 6 || i == 9 || i == 10 || i == 12 || i == 14 || i == 16 || i == 20 || i == 21))?Stock.weightFormat(prices[i]):AV.numberFormat(prices[i]);
                    }
                    else if((i == 1 || i == 3 || i == 13 || i == 15) && prices[i+1]>0)
                    {
                    value = 0;
                    }*/
                    var newValue = '';
                    if ((prices[i] && prices[i] != '0') || i == 7) {
                        if ((AV.App.volumnUnit == '10') && (i == 2 || i == 4 || i == 6 || i == 9 || i == 10 || i == 12 || i == 14 || i == 16 || i == 20 || i == 21 || i == 32 || i == 33 || i == 31 || i == 29)) {
                            newValue = Stock.weightFormat(prices[i]);
                        }
                        else if (i == 7) {
                            newValue = getChangePrice(prices[i]);
                        }
                        else {
                            newValue = AV.numberFormat(prices[i]);
                        }
                    }
                    else {
                        newValue = Stock.specialSymbols[3];
                    }
                    //var value = (((prices[i] && prices[i]!='0') || (i % 2 == 1 && i!=7 && i!= 9 && i< 17 && (prices[parseInt(i)+1]>0 || (!AV.App.showZeroPrice && (i==5 || i==11)))))?(((AV.App.volumnUnit == '10') && (i == 2 || i == 4 || i == 6 || i == 9 || i == 10 || i == 12 || i == 14 || i == 16 || i == 20 || i == 21))?Stock.weightFormat(prices[i]):AV.numberFormat(prices[i])):Stock.specialSymbols[3]);

                    td[AV.innerText] = newValue;
                }
            }
            /*if(Stock.floor == 'UPCOM' && (i == 1 || i == 3 || i == 5 || i == 11 || i == 13 || i == 15))
            {
            td = document.getElementById(symbol+'-'+(parseInt(i)+1));
            td.title = symbol + ' test - '+ Lang.price + ': '+AV.numberFormat(prices[i]);
            }*/
        }
        else
            if (oldHightLight && oldHightLight[i]) {
            var td = document.getElementById(symbol + '-' + i);
            //if(td.style.backgroundColor != 'transparent')
            if (td) {
                if (AV.App.hightlightColor == 'revert') {
                    var color = td.style.backgroundColor;
                    if (color) {
                        td.style.color = color;
                        td.style.backgroundColor = '';
                    }
                }
                else if (AV.App.boardType && AV.App.boardType == 'AGS') {
                    td.removeAttribute('style');
                    if (i == 6 || i == 12) {
                        if (AV.App.ATOcolor && (prices[i - 1] == 'ATC' || prices[i - 1] == 'ATO' || prices[i - 1] == 0)) {
                            td.style.color = AV.App.ATOcolor;
                        }
                    }
                    else if (i == 5 || i == 11) {
                        if (AV.App.ATOcolor && (prices[i] == 'ATC' || prices[i] == 'ATO')) {
                            td.style.color = AV.App.ATOcolor;
                        }
                    }
                    else if (i == 7) {
                        td.style.color = getStateColor(prices[i], stockInfo[1], stockInfo[2], stockInfo[3], i);
                    }
                }
                else {
                    td.style.backgroundColor = '';
                    if (AV.App.changeColor == 'priceOnly' && i != 7 && i != 8 && i != 9 && i != 10) {
                        td.style.color = '#ffff00';
                    }
                }
            }
        }
        oldHightLight[i] = hightlight[i];
        hightlight[i] = '';
        //}
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