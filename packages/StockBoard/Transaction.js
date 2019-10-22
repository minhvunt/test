Stock.Transaction = AV.extend(AV.Module, {
    status : 0,
    init: function() {
        Stock.transaction = this;
        AV.load('3rdparty/jQuery/webtoolkit.scrollabletable.js', '3rdparty/jQuery/webtoolkit.jscrollable.js');
    },
    draw: function () {
        return AV.template('Transaction.' + Stock.floor);
    },
    drawRow: function(index, ptt) {
        var obj = elem('ptt' + index);
        if (!obj) {
            var that = this;
            setTimeout(function() { that.drawRow(index, ptt); }, 100);
        }

        if (obj.firstChild.nextSibling) {
            var maxHeight = AV.App.pttScrollHeight ? AV.App.pttScrollHeight : 555;
            if (obj.firstChild.nextSibling.childNodes.length >= (maxHeight / 21 - 1) && !this['isTableScroll' + index]) {
                this['isTableScroll' + index] = 1;
                //$('#ptt' + index).Scrollable(maxHeight);
                $('#ptt' + index).css('width', '100%')/*.parent().css('width', '100%')*/;
                var table = $('#ptt' + index + ' tbody');
                if (location.href.indexOf('?local') == -1) {
                    table.css({ 'overflow-x': 'hidden', 'overflow-y': 'scroll' }).parent().css({ 'overflow-x': 'hidden', 'overflow-y': 'scroll' });
                }
                else {
                    table.css({ 'overflow': 'hidden' }).parent().css({ 'overflow': 'hidden' });
                }
                var wait = 0;

                var obj = document.getElementById('ptt' + index).firstChild.nextSibling.childNodes, lastTop = -1;
                //if ($.browser.msie) table = $('#ptt' + index).parent();
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
                }, AV.StockBoard.refreshRate ? AV.StockBoard.refreshRate / 50 : 50);
            }

            var clsName = AV.App.zebraTransactionRow ? ((index == '1') ? 'tbc-change' : 'tbc-sell') : '', title = '';
            if (Stock.allSymbols[ptt[0]] && parseInt(ptt[1]) != 0) {
                title = ' title="' + Stock.allSymbols[ptt[0]][4] + '"';
                clsName += ' ' + Stock.getState(ptt[4], Stock.allSymbols[ptt[0]][1], Stock.allSymbols[ptt[0]][2], Stock.allSymbols[ptt[0]][3]);
            }
            clsName = ' class="' + clsName + '"';

            var code = AV.template('TransactionRow.' + Stock.floor, { ptt: ptt, title: title, clsName: clsName, index: index });
            $('#ptt' + index + '>tbody').append(code);
        }
    },
    update: function () {
        var fileName = '';
        if (Stock.floor == 'HO') fileName = 'ho_pt';
        else fileName = 'hnx_pt';

        var ptt = '';
        $.ajax({
            type: "GET",
            url: Stock.dataFileName(fileName),
            cache: false,
            async: false,
            success: function (data) {
                var ptt = data.split('@');
                if (ptt != null) {
                    for (var i = 0; i < 3; i++) {
                        $('#ptt' + i + '>tbody>tr').each(function () {
                            $(this).remove();
                        });
                    }

                    if (Stock.floor == 'HO') {
                        //co 3 phan tu
                        for (var i in ptt) {
                            if (ptt[i]) {
                                if (typeof (ptt[i]) == 'string') {
                                    ptt[i] = ptt[i].split('|');

                                    for (var p = 0; p < ptt[i].length; p++) if (ptt[i][p]) {
                                        var pt = ptt[i][p].split(';');

                                        Stock.transaction.drawRow(i, pt);
                                    }
                                }
                            }
                        }
                    }
                    else {
                        //Co 2 phan tu
                        var data = ptt[0];
                        if (data) {
                            if (typeof (data) == 'string') {
                                data = data.split('|');

                                for (var p = 0; p < data.length; p++) if (data[p]) {
                                    var pt = data[p].split(';');

                                    Stock.transaction.drawRow(1, pt);
                                }
                            }
                        }
                    }
                }
            }
        });		
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
    onOpen: function () {
        var that = this;
        if (that.status == 0){
            that.status = 1;
            Stock.transaction.update();
        }            
        else {
            $AV('StockBoard.Transaction').close();
            that.status = 0;
        }           
        
        AV.Options.save('showTopPT', that.status);
    },
    onClose: function() {
        AV.Options.save('showTopPT', 0);
    }
});