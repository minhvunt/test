Stock.Transaction = AV.extend(AV.Module, {
	pauseScroll : false,
	pause:function(){
		Stock.Transaction.pauseScroll = !Stock.Transaction.pauseScroll;
	},
    init: function() {
        Stock.transaction = this;
        AV.load('3rdparty/jQuery/webtoolkit.scrollabletable.js', '3rdparty/jQuery/webtoolkit.jscrollable.js');
    },
    draw: function() {
        return AV.template('Transaction.' + Stock.floor);
    },
    drawRow: function(index, ptt, p) {
        var obj = elem('ptt' + index);

        if (!obj) {
            var that = this;
            setTimeout(function() { that.drawRow(index, ptt); }, 100);
        }
        if (obj.firstChild.nextSibling) {
            /*if(obj.firstChild.nextSibling.childNodes.length > 100)
            {
            $('#ptt' + index + '>tbody>tr:first').remove();
            }*/
            var maxHeight = AV.App.pttScrollHeight ? AV.App.pttScrollHeight : 555;
            if (obj.firstChild.nextSibling.childNodes.length >= (maxHeight / 21 - 1) && !this['isTableScroll' + index]) {
                this['isTableScroll' + index] = 1;
                $('#ptt' + index).Scrollable(maxHeight);
                $('#ptt' + index).css('width', '100%').parent().css('width', '100%');
                var table = $('#ptt' + index + ' tbody');
                if (location.href.indexOf('?local') == -1) {
                    table.css({ 'overflow-x': 'hidden', 'overflow-y': 'scroll' }).parent().css({ 'overflow-x': 'hidden', 'overflow-y': 'scroll' });
                    //table.css({ 'overflow': 'hidden' }).parent().css({ 'overflow': 'hidden' });
                }
                else {
                    table.css({ 'overflow': 'hidden' }).parent().css({ 'overflow': 'hidden' });
                }
                var wait = 0;


                var obj = document.getElementById('ptt' + index).firstChild.nextSibling.childNodes, lastTop = -1;
                if ($.browser.msie) table = $('#ptt' + index).parent();
                setInterval(function() {
                    if (Stock.Transaction.pauseScroll) return;
                    var top = table.scrollTop();
                    var length = obj.length;

                    if (top != lastTop) {
                        if (top == 0) {
                            if (wait < 30) {
                                wait++;
                            }
                            else {
                                table.scrollTop(1);
                                wait = 0;
                            }
                        }
                        else
                        //if(parseInt(top) + parseInt(maxHeight) < height)//(length+1) * 21+5
                        {
                            lastTop = top;
                            table.scrollTop(top + 1);
                        }
                    }
                    else
                        if (wait < 90) {
                        wait++;
                    }
                    else {
                        table.scrollTop(0);
                        lastTop = -1;
                        wait = 0;
                    }
                }, AV.LSXStockBoard.refreshRate ? AV.LSXStockBoard.refreshRate / 50 : 50);
            }

            var clsName = AV.App.zebraTransactionRow ? ((index == '1') ? 'tbc-change greybg' : 'tbc-sell') : '', title = '';
            if (Stock.allSymbols[ptt[0]] && parseInt(ptt[1]) != 0) {
                title = ' title="' + Stock.allSymbols[ptt[0]][4] + '"';
                clsName += ' ' + Stock.getState(ptt[1], Stock.allSymbols[ptt[0]][1], Stock.allSymbols[ptt[0]][2], Stock.allSymbols[ptt[0]][3]);
            }
            clsName = ' class="' + clsName + '"';
            var trClassName = (p % 2 == 1) ? 'odd' : 'even';
            //alert(clsName);
            var code = AV.template('TransactionRow.' + Stock.floor, { ptt: ptt, title: title, clsName: clsName, index: index, trClassName: trClassName });
            $('#ptt' + index + '>tbody').append(code);
        }
    },
    update: function() {

        var ptt = Stock.pttData;

        for (var i in ptt) {
            if (ptt[i]) {
                if (typeof (ptt[i]) == 'string') {
                    /*if(AV.App.PTTxml)
                    {
                    $('#ptt' + i + ' tbody tr').remove();
                    }*/
                    ptt[i] = ptt[i].split('|');
                    if (Stock.floor == 'HA') {
                        $('#ptt1>tbody>tr').each(function() {
                            $(this).remove();
                        });
                    }
                    for (var p = 0; p < ptt[i].length; p++) if (ptt[i][p]) {
                        var pt = ptt[i][p].split(';');

                        Stock.transaction.drawRow(i, pt, p);
                    }
                }
            }
        }
    },
    show: function(obj) {
        //$('.menu-active').removeClass('menu-active');
        //$(obj).addClass('menu-active');
        $('#put-through-block').show();
        if (!AV.App.showPTTinBoard) {
            $('#stockBoardRegion').hide();
        }
        $('#price-history').hide();
        $('#index-history').hide();
        if (!AV.App.showPTTinBoard) {
            Stock.currentTab = 'put-through-block';
        }
        if (Stock.floor == 'HA') {
            $('#transTime').hide();
            $('#transTolVol').show();
            $('#transTolVal').show();
            $('#transTolVal').css('width', '30px');
            $('#transBuy').hide();
            $('#transAsk').hide();
        } else {
            $('#transTime').show();
            $('#transTolVol').hide();
            $('#transTolVal').hide();
            $('#transBuy').show();
            $('#transAsk').show();
        }
    },
    onOpen: function() {
        AV.Options.save('showTopPT', 0);
    },
    onClose: function() {
        AV.Options.save('showTopPT', 0);
    }
});