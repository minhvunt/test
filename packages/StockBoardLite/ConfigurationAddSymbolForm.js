Stock.ConfigurationAddSymbolForm = AV.extend(AV.Module, {
    currentListId: false,
    firstTime: true,
    draw: function() {
        return AV.template('ConfigurationAddSymbolForm');
    },
    reinitListAutoComplete: function() {
        var that = this;

        AV.read((Stock.localhost ? Stock.accountHref : '') + '/Forms/Configuration.ashx?a=GetList&t=' + new Date().getTime() + '&b=' + AV.cookie('UserLogin'), { dataType: 'json' }, function(response) {
            that.lists = response.List;
            //			alert(that.lists);
            var items = [];
            var count = ($.browser.msie) ? that.lists.length - 1 : that.lists.length;
            for (var i = 0; i < count; i++) {
                items.push(that.lists[i].List_Name);
                if (!that.currentListId && that.lists[i].isDefault) {
                    $('#select-list').val(that.lists[i].List_Name);
                    that.selectList(that.lists[i].List_Id);
                    //break;
                }
            }
            //$('#select-list').setOptions({ data: items });
        });
    },
    initForm: function() {
        var that = this;
        $('#add-symbol-form, #add-symbol-float-form').submit(function() {
            that.cmd('add', this.symbol.value);
            this.symbol.value = '';
            return false;
        });
        AV.load('3rdparty/jQuery/autocomplete/jquery.autocomplete.js', function() {
            $('.add-symbol-input').autocomplete(Stock.companies, {
                width: 300,
                mouseDownOnSelect: true,
                minChars: 0,
                formatMatch: function(row, i, max) {
                    return row;
                },
                formatResult: function(row) {
                    return row;
                }
            }).bind("result", function(e) {
                that.cmd('add', this.value);
                var list = that.getListId($('#select-list').val());
                if (list) {
                    this.value = '';
                }
            });
            AV.read((Stock.localhost ? Stock.accountHref : '') + '/Forms/Configuration.ashx?a=GetList&t=' + new Date().getTime() + '&b=' + AV.cookie('UserLogin'), { dataType: 'json' }, function(response) {
                that.lists = response.List;
                var items = [];
                var count = ($.browser.msie) ? that.lists.length - 1 : that.lists.length;
                for (var i = 0; i < count; i++) {
                    items.push(that.lists[i].List_Name);
                    if (!that.currentListId && that.lists[i].isDefault) {
                        $('#select-list').val(that.lists[i].List_Name);

                        //break;
                    }
                }
                that.selectList(that.lists[count - 1].List_Id);
                $('#select-list').autocomplete(items, {
                    width: 300,
                    minChars: 0,
                    mouseDownOnSelect: true,
                    formatMatch: function(row, i, max) {
                        return row;
                    },
                    formatResult: function(row) {
                        return row;
                    }
                }).bind("result", function(e) {
                    //that.cmd('add', this.value);

                    var listId = that.getListId(this.value);
                    if (listId) {
                        that.selectList(listId);
                    }
                });
            });
        });
        AV.load('3rdparty/jQuery/ui/ui.core.js', '3rdparty/jQuery/validate/jquery.validate.min.js', function() {
            AV.load('3rdparty/jQuery/ui/ui.draggable.js', function() {
                $('#add-symbol-div, #add-category-div, #confirm-remove-category-div').draggable({ cancel: 'form', containment: 'body' });
                $('#add-category-float-form').validate({
                    rules: {
                        name: {
                            required: true
                        }
                    },
                    messages: {
                        name: {
                            required: Lang.Name_is_required
                        }
                    },
                    submitHandler: function(form) {
                        $AV('StockBoardLite.AddSymbolForm').addListClick($.trim(form.name.value)/*, $.trim(form.symbols.value)*/)
                    }
                });
            });
        });
    },
    filterSymbolList: function(floor) {
        var symbols = {}, allow = {};
        switch (floor) {
            case 'HOSE': allow[1] = true; break;
            case 'HNX': allow[2] = true; break;
            case 'UPCOM': allow[3] = true; break;
            case 'HOSE,HNX': allow[1] = allow[2] = true; break;
            default: allow[1] = allow[2] = allow[3] = true; break;
        }
        var floors = { 1: 'HOSE', 2: 'HNX', 3: 'UPCOM' }, obj = $('#addSymbol-symbolList');
        obj.find('tr').remove();
        for (var i in Stock.allSymbols) {
            var symbol = Stock.allSymbols[i];
            if (allow[symbol[6]] && !AV.Options.showSymbols[Stock.floor][i]) {
                obj.append('<tr onmouseover="Stock.board.trOver(this)" onmouseout="Stock.board.trOut(this)" onclick="$AV(\'StockBoardLite.AddSymbolForm\').cmd(\'add\', \'' + i + '\');$(this).remove();"><td>' + floors[symbol[6]] + '</td><td>' + i + '</td><td>' + symbol[4] + '</td></tr>');
            }
        }
        $('#add-symbol-float-form input:first').focus();
    },
    cmd: function(cmd, symbol) {
        if (!symbol) {
            symbol = $('#add-symbol-input').val().toUpperCase();
        }

        if (!symbol) return;

        if (symbol.indexOf(' -') != -1) {
            symbol = symbol.substr(0, symbol.indexOf(' -'));
        }
        $('#add-symbol-input').val(symbol);
        /*if(!Stock.securities[symbol])
        {
        return;
        }*/
        if (!Stock.allSymbols[symbol]) {
            AV.alert('MÃ£ khÃ´ng há»£p lá»‡!');
            return;
        }
        if (!cmd) {
            cmd = (AV.Options.showSymbols[Stock.floor][symbol]) ? 'remove' : 'add';
        }
        var list = this.getListId($('#select-list').val());
        if (cmd == 'add') {
            if (AV.Options.showSymbols[Stock.floor][symbol]) return;

            if ($('#add-category-div').css('display') != 'none') {
                var value = $('#add-category-div input[name="symbols"]').val();
                $('#add-category-div input[name="symbols"]').val((value ? value + ',' : '') + symbol);
                $('#add-symbol-div').hide();
            }
            else {
                if (list) {
                    AV.Options.showSymbols[Stock.floor][symbol] = 1;

                    AV.read((Stock.localhost ? Stock.accountHref : '') + '/Forms/Configuration.ashx?a=UpdateSymbol&b=' + list + '&c=' + symbol + '&t=' + (new Date().getTime()), function(response) {
                        if (response == 0) {
                            AV.alert('Lá»—i há»‡ thá»‘ng, khÃ´ng thÃªm Ä‘Æ°á»£c!');
                        }
                    });

                    Stock.orderedItems.push(symbol);
                    this.recheckOptions();
                    //Stock.orderedItems.sort(Stock.Board.prototype.columnOrder);
                }
                else {
                    return;
                }
            }
        }
        else
            if (AV.Options.showSymbols[Stock.floor][symbol]) {
            AV.Options.showSymbols[Stock.floor][symbol] = null;
            delete AV.Options.showSymbols[Stock.floor][symbol];
            for (var i = 0; i < Stock.orderedItems.length; i++) {
                if (Stock.orderedItems[i] == symbol) {
                    Stock.orderedItems.splice(i, 1);
                    break;
                }
            }
            if (list) {
                AV.read((Stock.localhost ? Stock.accountHref : '') + '/Forms/Configuration.ashx?a=DeleteSymbol?b=' + list + '&c=' + symbol + '&t=' + (new Date().getTime()), function(response) {
                    if (response == 0) {
                        AV.alert('Lá»—i há»‡ thá»‘ng, khÃ´ng xÃ³a Ä‘Æ°á»£c!');
                    }
                });
            }
        }
        AV.Options.save('showSymbols');
        //        $('.stockBoard tbody tr').remove();
        //        Stock.board.drawContent();
    },
    selectList: function(id) {
        if (id) {
            var that = this;
            AV.read((Stock.localhost ? Stock.accountHref : '') + '/Forms/Configuration.ashx?a=GetSymbol&b=' + id + '&t=' + (new Date().getTime()), { dataType: 'json' }, function(response) {
                if (response) {
                    //Load toan bo thong tin cua Config nay ra
                    that.currentListId = id;

                    $('#add-symbol-input').val('');
                    Stock.orderedItems = [];
                    AV.Options.save('listID', id);

                    var stocks = AV.Options.showSymbols[Stock.floor];

                    for (var i = 0; i < stocks.length; i++) {
                        stocks[stocks[i]] = 1;
                        Stock.orderedItems.push(stocks[i]);
                    }

                    var obj = response;
                    AV.Options.showSymbols = obj.showSymbols;
                    that.recheckOptions();
                    AV.Options.showFavouriteItems = obj.showFavouriteItems;
                    $('#showFavouriteItems').attr('checked', AV.Options.showFavouriteItems);
                    AV.Options.showTopReport = obj.showTopReport;
                    $('#showTopReport').attr('checked', AV.Options.showTopReport);
                    AV.Options.showTopPT = obj.showTopPT;
                    $('#showTopPT').attr('checked', AV.Options.showTopPT);
                    AV.Options.favouriteItems = obj.favouriteItems;
                    AV.Options.orderDir = obj.orderDir;
                    AV.Options.orderingColumn = obj.orderingColumn;
                    AV.Options.oldCssIndexes = obj.oldCssIndexes;
                    AV.Options.topSymbols = obj.topSymbols;
                    AV.Options.language = obj.language;
                    AV.Options.boardStyle = obj.boardStyle;
                    $('#rbtBoard' + AV.Options.boardStyle == '100%' ? '100percent' : AV.Options.boardStyle).attr('checked', 1);
                    AV.Options.volColor = obj.volColor;
                    AV.Options.fontStyle = obj.fontStyle;
                    $('#rbtFont' + AV.Options.fontStyle).attr('checked', 1);
                    AV.Options.hideColumns = obj.hideColumns;

                    var objHide = AV.Options.hideColumns[Stock.floor].toString().split(',');
                    //alert(obj[0]);
                    $('#chkShowBuyVolume').attr('checked', parseInt(objHide[0]) == 0 ? 1 : 0); //buyVolume
                    $('#chkShowSellVolume').attr('checked', parseInt(objHide[1]) == 0 ? 1 : 0); //sellVolume
                    $('#chkShowBuyOrderCount').attr('checked', parseInt(objHide[2]) == 0 ? 1 : 0); //buyOrderCount
                    $('#chkShowSellOrderCount').attr('checked', parseInt(objHide[3]) == 0 ? 1 : 0); //sellOrderCount
                    $('#chkShowForeignBuy').attr('checked', parseInt(objHide[4]) == 0 ? 1 : 0); //foreignBuy
                    $('#chkShowForeignSell').attr('checked', parseInt(objHide[5]) == 0 ? 1 : 0); //foreignSell
                    $('#chkShowCurrentRoom').attr('checked', parseInt(objHide[6]) == 0 ? 1 : 0); //currentRoom
					$('#chkShowAverageVol').attr('checked', parseInt(objHide[7]) == 0 ? 1 : 0); //averageVol

                    AV.Options.scrollDelay = obj.scrollDelay;
                    $('#txtScrollInterval').attr('value', AV.Options.scrollDelay);
                    AV.Options.waitingTime = obj.waitingTime;
                    $('#txtWaitingTime').attr('value', AV.Options.waitingTime);
                    AV.Options.lineHeight = obj.lineHeight;
                    AV.Options.lineCount = obj.lineCount;
                    $('#txtLineCount').attr('value', AV.Options.lineCount);
                    AV.Options.tableType = obj.tableType;
                    $('#rbt' + AV.Options.tableType[Stock.floor]).attr('checked', 'checked');
                    AV.Options.screenWidth = obj.screenWidth;
                    $('#rbt' + ((AV.Options.screenWidth == '100%') ? '100percent' : AV.Options.screenWidth)).attr('checked', 'checked');
                    //alert(obj.screenWidth);
                    //AV.Options.save();
                    //location.reload();
                    //that.recheckOptions();
                    //alert('hehe');
                    //$('.stockBoard tbody tr').remove();
                    //Stock.board.drawContent();
                }
            });
        }
    },
    saveOption: function(name, value) {
        if (typeof (value) != 'undefined' && AV.Options[name] != value) {
            AV.Options[name] = value;

        }
    },
    getOptions: function() {
        //location = '#';
        var that = this;
        //this.saveTopSymbolsOption();
        /* Chọn các mã CK để hiện : @SangNT*/
        delete AV.Options.showSymbols[Stock.floor];
        AV.Options.showSymbols[Stock.floor] = {};
        var obj = $('#selectSymbols');
        if (obj.length) {
            var i = 1;
            for (var j in Stock.allSymbols) {
                if (obj.find('option[selected][value=' + j + ']').length) {
                    AV.Options.showSymbols[Stock.floor][j] = i++;
                }
                /*obj.find('option[selected]').each(function(){
                var name = $(this).attr('value');
                AV.Options.showSymbols[Stock.floor][name] = i++;
                });*/
            }
        }
        else {
            if ($('#tableSymbols tr td input:checkbox:checked').length != $('#tableSymbols tr td input:checkbox').length) {
                $('#tableSymbols tr td input:checkbox:checked').each(function() {
                    var name = $(this).attr('name');
                    AV.Options.showSymbols[Stock.floor][name] = 1;
                });
            }
            else {
                AV.Options.showSymbols[Stock.floor] = false;
            }
        }
        var all = true;
        for (var i in Stock.allSymbols) {
            if (!AV.Options.showSymbols[Stock.floor][i]) {
                all = false;

                break;
            }
        }
        if (all) AV.Options.showSymbols[Stock.floor] = false;
        
        
        this.saveOption('screenWidth', $('input[name=ScreenWidth]:checked').val());
        this.saveOption('lineCount', $('#txtLineCount').val());
        //alert($('#txtLineCount').val());
        this.saveOption('scrollDelay', parseInt($('#txtScrollInterval').val()));
        this.saveOption('waitingTime', $('#txtWaitingTime').val());
        if (!AV.Options.tableType || typeof (AV.Options.tableType) != 'object') AV.Options.tableType = {};
        AV.Options.tableType[Stock.floor] = $('input[name=TableType]:checked').val();
        if ($('input[name=fontStyle]').length) {
            this.saveOption('fontStyle', $('input[name=fontStyle]:checked').val());
        }
        if ($('input[name=volColor]').length) {
            this.saveOption('volColor', $('input[name=volColor]:checked').val() ? 1 : 0);
        }
        else {
            this.saveOption('volColor', AV.Options.definitions.volColor);
        }
        this.saveOption('boardStyle', $('input[name=selectBoard]:checked').val());
        this.saveOption('showTopReport', $('#showTopReport').attr('checked'));
        this.saveOption('showFavouriteItems', $('#showFavouriteItems').attr('checked'));
        this.saveOption('showTopPT', $('#showTopPT').attr('checked'));
        AV.Options.hideColumns[Stock.floor] =
        //this.saveOption('hideColumns',
		[
        //0 la hien, 1 la an
			$('input[name=chkShowBuyVolume]').attr('checked') ? 0 : 1, //buyVolume
			$('input[name=chkShowSellVolume]').attr('checked') ? 0 : 1, //sellVolume
			$('input[name=chkShowBuyOrderCount]').attr('checked') ? 0 : 1, //buyOrderCount
			$('input[name=chkShowSellOrderCount]').attr('checked') ? 0 : 1, //sellOrderCount
			$('input[name=chkShowForeignBuy]').attr('checked') ? 0 : 1, //foreignBuy
			$('input[name=chkShowForeignSell]').attr('checked') ? 0 : 1, //foreignSell
			$('input[name=chkShowCurrentRoom]').attr('checked') ? 0 : 1,//currentRoom
			$('input[name=chkShowAverageVol]').attr('checked') ? 0 : 1//AverageVol
		];

        AV.Options.save();
    },
    addListClick: function(name/*, symbols*/) {
        //var name = prompt('Nháº­p tÃªn danh sÃ¡ch Ä‘á»ƒ lÆ°u láº¡i');
        if (name) {
            /*if (!symbols) {
            AV.alert('ChÆ°a nháº­p mÃ£ khá»Ÿi táº¡o!');
            return;
            }*/
            var that = this;
            /*symbols = symbols.toUpperCase();
            var stocks = symbols.split(',');
            for (var i = 0; i < stocks.length; i++) {
            if (!Stock.allSymbols[stocks[i]]) {
            AV.alert('MÃ£ khÃ´ng há»£p lá»‡!');
            return;
            }
            }*/
            that.getOptions();
            $.post((Stock.localhost ? Stock.accountHref : '') + '/Forms/Configuration.ashx', { a: "UpdateList", b: name, c: $.toJSON(AV.Options), t: new Date().getTime() }, function(response) {
                if (response < 0) {
                    AV.alert('Lá»—i há»‡ thá»‘ng, khÃ´ng thÃªm Ä‘Æ°á»£c!');
                }
                else
                    if (response == 0) {
                    if (symbols == '') {
                        AV.alert('Nháº­p mÃ£ chá»©ng khoÃ¡n khá»Ÿi táº¡o danh má»¥c!');
                    }
                    else {
                        AV.alert('TrÃ¹ng tÃªn danh má»¥c Ä‘Ã£ tá»“n táº¡i, khÃ´ng thÃªm Ä‘Æ°á»£c!');
                    }
                }
                else {
                    //$('#select-list option[value=""]').remove();
                    $('#add-category-div').hide();
                    //var sel = $('#select-list');
                    //sel.append('<option value="'+response+'" selected>'+name+'</option>');
                    //that.reinitListAutoComplete();
                    //that.selectList(response);
                    location.reload();
                }
            });
        }
    },
    removeListClick: function(dontConfirm) {
        var listName = $('#select-list').val(), id = this.getListId(listName), that = this;

        if (id) {
            if (!dontConfirm) {
                $('#confirm-remove-category-div').show();
                return;
            }

            AV.read((Stock.localhost ? Stock.accountHref : '') + '/Forms/Configuration.ashx?a=DeleteList&b=' + id + '&t=' + (new Date().getTime()), function(response) {
                if (response <= 0) {
                    AV.alert('Lá»—i há»‡ thá»‘ng!');
                }
                else {
                    $('#confirm-remove-category-div').hide();
                    AV.Options.showSymbols[Stock.floor] = {};
                    Stock.orderedItems = [];
                    AV.Options.save('showSymbols');
                    $('.stockBoard tbody tr').remove();
                    that.currentListId = 0;
                    that.reinitListAutoComplete();
                    $('#select-list').val('');
                    location.reload();
                    //$('#select-list option[value='+id+']').remove();
                    /*if($('#select-list option').length == 1)
                    {
                    $('#select-list').append('<option value="">Danh má»¥c</option>');
                    }*/
                }
            });
        }
        else {
            AV.alert('Danh má»¥c khÃ´ng há»£p lá»‡');
        }
    },
    saveDefaultList: function() {
        var id = $('#select-list').val();
        AV.read((Stock.localhost ? Stock.accountHref : '') + '/Forms/Configuration.ashx?a=SetDefaultList.aspx?a=' + id + '&t=' + (new Date().getTime()), function(response) {
            if (response <= 0) {
                AV.alert('Lá»—i há»‡ thá»‘ng!');
            }
            else {
                AV.alert('Cáº­p nháº­t thÃ nh cÃ´ng!');
            }
        });
        //AV.Options.currentList = $('#select-list').val(); AV.Options.save('currentList');
        //AV.alert('Save default list: '+$('#select-list').val()+' (Sua o trong ham /packages/StockBoardLite/AddSymbolForm.js - saveDefaultList())');
    },
    getListId: function(name) {
        if (this.lists && name) {
            for (var i = 0; i < this.lists.length; i++) {
                if (this.lists[i].List_Name == name) {
                    return this.lists[i].List_Id;
                }
            }
        }
    },
    getListName: function(id) {
        if (this.lists && id) {
            for (var i = 0; i < this.lists.length; i++) {
                if (this.lists[i].List_Id == id) {
                    return this.lists[i].List_Name;
                }
            }
        }
        return '';
    },

    addClick: function() {
        var listName = $('#select-list').val(), /*symbol = $('#add-symbol-input').val(), */listId = this.getListId(listName);

        if (listId) {
            if (listId != this.currentListId) {
                that.selectList(this.currentListId);
            }
            /*if (symbol) {
            this.cmd('add', symbol);
            }*/
        }
        else
            if (listName) {
            //if (symbol) {
            this.addListClick(listName/*, symbol*/);
            //}
        }
    },
    showAllSymbols: function() {
        Stock.orderedItems = [];
        for (var symbol in Stock.allSymbols) {
            AV.Options.showSymbols[Stock.floor][symbol] = 1;
            Stock.orderedItems.push(symbol);
        }
        Stock.orderedItems.sort(Stock.Board.prototype.columnOrder);
        $('.stockBoard tbody tr').remove();
        //Stock.board.drawContent();
    },
    recheckOptions: function() {
        $('#tableSymbols tr td input:checkbox').each(function() {
            //Tim xem ma nao co trong danh sach thi check
            if (AV.Options.showSymbols[Stock.floor]) {
                $(this).removeAttr('checked');
                if (AV.Options.showSymbols[AV.StockBoardLite.floor] && AV.Options.showSymbols[AV.StockBoardLite.floor][$(this).attr('name')])
                    $(this).attr('checked', '1');
            }
            else
                $(this).attr('checked', 1);
        });
    }
});