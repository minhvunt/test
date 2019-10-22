var Favorite = Stock.Favourite.AddItem = AV.extend(AV.Module, {
    layout: 'AddFavouriteItemForm',
    init: function() {
        var that = this;
        AV.load('3rdparty/jquery.auto-complete.js', function() {
            AV.Module.prototype.init.call(that);
        });
    },
    initEvents: function() {
        var that = this;
        $('#favourite-name').autocomplete(Stock.companies, {
            width: 300,
            formatMatch: function(row, i, max) {
                return row;
            },
            formatResult: function(row) {
                return row;
            }
        }).bind("result", function(data) {
            $('#add-favourite-form').submit();
        });

        $('#add-favourite-form').submit(function() {
            var value = $('#favourite-name').val().toUpperCase();
            $('#favourite-name').val('');
            that.addSymbol(value);
            return false;
        });

        $('#cat_ff li').remove();
        $('#cat_ff>ul').append('<li id="list_1" value="list_user"><a href="#bang-gia">' + Lang.SELECT_LIST + '</a></li>');

        //Load data vao cac options
        AV.read(Stock.localhost ? 'data/categories.txt?' : ('../../../' + 'HO' + '.ashx?FileName=ff' + ((AV.Options.language == 'en') ? '' : '') + '&t=' + (new Date().getTime())), { async: false }, function(ffData) {
            if (ffData) {
                var items = ffData.split('|');
                //console.log(items);
                for (var i = 0; i < items.length; i++) {
                    items[i] = items[i].split(';');
                }
                if (location.href.indexOf('HOSE') >= 0 || location.href.indexOf('ALL') >= 0) {
                    $('#cat_ff').append('<li id="list_3" value="list_hose" onclick="$AV(\'StockBoard.Favourite.AddItem\').selectList(this, false);"><a class="has-table" href="#bang-gia">' + Lang.LIST_HOSE + '</a></li>');
                }
                    
                //Add vao combobox
                var hnxIndexId = -1;
                var upcomIndexId = -1;
                var vn30IndexId = -1;
                var hnx30IndexId = -1;
                for (var i = 0; i < items.length; i++) {
                    var s = '';
                    var name = items[i][0];
                    if (name == 'HNXIndex') {
                        name = "HNX";
                        hnxIndexId = (i + 5).toString();
                    }
                    else if (name == 'HNXUpcomIndex') upcomIndexId = (i + 5).toString();
                    else if (name == 'VN30') vn30IndexId = (i + 5).toString();
                    else if (name == 'HNX30') hnx30IndexId = (i + 5).toString();
                    for (var j = 1; j < items[i].length; j++) {
                        if (items[i][j] != '') {
                            s += items[i][j];

                            if (j < items[i].length - 1) {
                                s += ';';
                            }
                        }
                    }
                        
                    var text = '';
                    if (location.href.indexOf('HOSE') >= 0) {
                        //Neu la Hose
                        if (name.indexOf('VN') >= 0)
                            text = '<li id="list_' + (5 + i) + '" value="' + s + '" onclick="$AV(\'StockBoard.Favourite.AddItem\').selectList(this, false);"><a class="has-table" href="#bang-gia">' + name + '</a></li>';
                    }
                    else
                        text = '<li id="list_' + (5 + i) + '" value="' + s + '" onclick="$AV(\'StockBoard.Favourite.AddItem\').selectList(this, false);"><a class="has-table" href="#bang-gia">' + name + '</a></li>';

                    if (text != '')
                        $('#cat_ff').append(text);
                }

                if (location.href.indexOf('ALL') >= 0) {
                    $('#cat_ff').append('<li id="list_all" value="list_all" onclick="$AV(\'StockBoard.Favourite.AddItem\').selectList(this, false);"><a class="has-table" href="#bang-gia">' + Lang.LIST_ALL + '</a></li>');
                }
                //Kiem tra xem co dang chon list nao khong

                if (AV.Options.selectionID != '') {
                    that.selectList(document.getElementById(AV.Options.selectionID), false);
                }
            }
        });

        //Load nganh
        $('#cat_industry li').remove();
        $('#filter_san option').remove();
        
        $.ajax({
            type: 'POST',
            url: 'https://algoplatform.vn/pbapi/api/industryList',
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            headers: {
                'X-TOKEN': AV.StockBoard.token,
                'Content-type': 'application/x-www-form-urlencoded'
            },
            data: { postData: '{"lang":"vi"}' },
            async: false,
            success: function (response) {
                $('#filter_san').append('<option value="">Lọc theo ngành</option>');
                $.each(response, function (key, item) {
                    $('#cat_industry').append('<li id="list_' + item.IndustryCode + '" value="' + item.SecList + '" onclick="$AV(\'StockBoard.Favourite.AddItem\').selectList(this, false);"><a class="has-table" href="#bang-gia">' + item.IndustryName + '</a></li>');

                    //Them vao cho filter
                    $('#filter_san').append('<option value="' + item.IndustryCode + '">' + item.IndustryName + '</option>');
                });
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });    

        //Load danh muc
        $('#cat_portfolio li').remove();

        $.ajax({
            type: "GET",
            url: 'https://algoplatform.vn/pbapi/api/getPortfolios',
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            headers: {
                'X-TOKEN': AV.StockBoard.token,
                'Content-type': 'application/x-www-form-urlencoded'
            },
            cache: false,
            async: false,
            success: function (data) {
                var data1 = JSON.parse(data.dict.items);
                $.each(data1, function (key, item) {
                    $('#cat_portfolio').append("<li value='" + item.SecList + "' class='list__item' onclick='$AV(\"StockBoard.Favourite.AddItem\").selectList(this, false);'><a class='list__name'><i class='fas fa-check-circle'></i><a class='has-table' href='#bang-gia'>" + item.Name + "</a></span><input class='is-hidden' type='text'><span class='list__buttons'><a class='txt-white btn--edit' href='#' title='Sửa'><i class='fas fa-edit'></i></a><a class='txt-white btn--delete' href='#' title='Xóa'><i class='fas fa-times'></i></a></span></li>");
                });
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });

        //Load bo loc mac dinh
        $('#cat_filter li').remove();

        $.ajax({
            type: "GET",
            url: 'https://algoplatform.vn/pbapi/api/getSystemFilters',
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            headers: {
                'X-TOKEN': AV.StockBoard.token,
                'Content-type': 'application/x-www-form-urlencoded'
            },
            cache: false,
            async: false,
            success: function (data) {
                var data1 = JSON.parse(data.dict.items);
                $.each(data1, function (key, item) {
                    $('#cat_filter').append("<li value='" + item.Criteria + "' class='list__item' onclick='$AV(\"StockBoard.Favourite.AddItem\").queryFilter(this, false);'><a class='list__name'><i class='fas fa-check-circle'></i><a class='has-table' href='#bang-gia'>" + item.Name + "</a></span><input class='is-hidden' type='text'><span class='list__buttons'><a class='txt-white btn--edit' href='#' title='Sửa'><i class='fas fa-edit'></i></a><a class='txt-white btn--delete' href='#' title='Xóa'><i class='fas fa-times'></i></a></span></li>");
                });
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });

        //Load user filter
        $.ajax({
            type: "GET",
            url: 'https://algoplatform.vn/pbapi/api/getFilters',
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            headers: {
                'X-TOKEN': AV.StockBoard.token,
                'Content-type': 'application/x-www-form-urlencoded'
            },
            cache: false,
            async: false,
            success: function (data) {
                var data1 = JSON.parse(data.dict.items);
                $.each(data1, function (key, item) {
                    $('#cat_filter').append("<li value='" + item.Criteria + "' class='list__item' onclick='$AV(\"StockBoard.Favourite.AddItem\").queryFilter(this, false);'><a class='list__name'><i class='fas fa-check-circle'></i><a class='has-table' href='#bang-gia'>" + item.Name + "</a></span><input class='is-hidden' type='text'><span class='list__buttons'><a class='txt-white btn--edit' href='#' title='Sửa'><i class='fas fa-edit'></i></a><a class='txt-white btn--delete' href='#' title='Xóa'><i class='fas fa-times'></i></a></span></li>");
                });
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    },
    selectList: function(data, check) {

        var that = this;
        var value = $(data).attr('value');
        var id = $(data).attr('id');
        if (value === 'undefined' || value == null) return;
        if (id == 'list_user') {
            that.updateList(value);
        }
        else if (value.indexOf(';') >= 0 || value.indexOf(',') >= 0) {
            $('#boardData tr').remove();
            var tmp = value.split(';');
            if (tmp.length < 2)
                tmp = value.split(',');
            
            for (var i = 0; i < tmp.length; i++) {
                if (tmp[i] != '')
                //Dua tung ma len danh sach
                    that.updateList(tmp[i]);
            }
        } else {
            AV.Options.showType['HO'] = false;
            AV.Options.showType['HA'] = false;
            AV.Options.showType['HA_ODD'] = false;
            AV.Options.showType['UPCOM'] = false;
            AV.Options.showType['ALL'] = false;
            AV.Options.showType['USER'] = false;

            if (data.value == 'list_hose') {
                //Neu la xem bang HOSE
                AV.Options.showType['HO'] = true;
            } else if (data.value == 'list_hnx') {
                //Neu la xem bang HNX
                AV.Options.showType['HA'] = true;
            } else if (data.value == 'list_hnx_odd') {
                //Neu la xem bang HNX Lo le
                AV.Options.showType['HA_ODD'] = true;
            } else if (data.value == 'list_upcom') {
                //Neu la xem bang UPCOM
                AV.Options.showType['UPCOM'] = true;
            } else if (data.value == 'list_all') {
                //Neu la xem toan bo
                AV.Options.showType['ALL'] = true;
            } else {
                //Neu la xem theo danh muc nguoi dung
                AV.Options.showType['USER'] = true;
            }

            that.updateList(value);
        }

        if (check) {
            AV.Options.selectionID = listID;
            AV.Options.save('selectionID', listID);
        }

        if (id != 'list_1') {
            $('#favourite-name').attr('disabled', true);
            $('#btnXoa').attr('disabled', true);
        } else {
            $('#favourite-name').attr('disabled', false);
            $('#btnXoa').attr('disabled', false);
        }

        //delete AV.Options.orderDir;
        //delete AV.Options.orderingColumn;

        //AV.Options.save();

        tippy('.tooltip', {
            arrow: true,
            placement: 'top',
            size: 'large',
            theme: 'google',
        }); 
    },
    addSymbol: function(value) {
        //Submit form khi nhap vao
        //Xu ly them vao showSymbol
        if (!AV.Options.showSymbols['DOUBLE']) {
            AV.Options.showSymbols['DOUBLE'] = {};
        }

        var symbol = $.trim((value.indexOf('-') == -1) ? value.toUpperCase() : value.substr(0, value.indexOf('-'))).toUpperCase(); ;

        //Neu la Xoa
        //Xoa dong nay di
        if ($('#tr' + symbol).length > 0) {
            //Neu da co

            //Xoa dong nay di
            $('#tr' + symbol).remove();
            //Luu vao Options
            delete AV.Options.showSymbols['DOUBLE'][symbol];
        }
        else {
            console.log('Add - ' + symbol + ' - ' + AV.Options.showSymbols['DOUBLE'][symbol]);
            //if (!AV.Options.showSymbols['DOUBLE'][symbol] || parseInt(AV.Options.showSymbols['DOUBLE'][symbol]) == 0 || typeof (AV.Options.showSymbols['DOUBLE'][symbol]) == 'undefined') {
                //Neu chua co dong nay thi them vao bang gia			
                if (Stock.securities[symbol] && typeof (Stock.securities[symbol]) != 'undefined') {
                    $('#boardData').append(Stock.board.drawRow(Stock.securities[symbol], 0));

                    //Luu vao Options
                    AV.Options.showSymbols['DOUBLE'][symbol] = 1;
                }
            //}
        }

        AV.Options.save();
    },
    removeAll: function() {
        $('#boardData tr').remove();
        delete AV.Options.showSymbols['DOUBLE'];
        //Xoa tinh trang order hien tai di
        delete AV.Options.orderDir;
        delete AV.Options.orderingColumn;
        AV.Options.save();
    },
    updateList: function(value) {
        var that = this;
        //Loai cac ma o topSymbols di
        if (value == 'list_hose' || value == 'list_hnx' || value == 'list_hnx_odd' || value == 'upcom' || value == 'list_all') {
            if (Stock.orderedItems)
                Stock.orderedItems = [];

            $('#boardData tr').remove();
            //Neu hien bang gia HOSE
            var floor_id = 0;
            switch (value) {
                case 'list_hose':
                    floor_id = 100;
                    break;
                case 'list_hnx':
                case 'list_hnx_odd':
                    floor_id = 2;
                    break;
                case 'list_upcom':
                    floor_id = 3;
                    break;
            }
            //Neu la bang theo san thi hien cac ma thuoc san do
            var count = 0;
            $.each(Stock.securities, function(symbol, value) {
                if (parseInt(value.prices[32]) == floor_id || parseInt(floor_id) == 0) {
                    if (Stock.board.checkTopSymbols(symbol) === 0) {
                        Stock.orderedItems.push(symbol);
                        $('#boardData').append(Stock.board.drawRow(value, count));
                        count++;
                    }
                }
            });
        }
        else if (value === 'list_user') {
            $('#boardData tr').remove();
            //Neu theo danh sach
            if (AV.Options.showSymbols['DOUBLE'] && typeof (AV.Options.showSymbols['DOUBLE']) !== 'undefined') {
                var count = 0;
                $.each(AV.Options.showSymbols['DOUBLE'], function(symbol, value) {
                    if (value || parseInt(value) === 1) {
                        if (Stock.board.checkTopSymbols(symbol) === 0) {
                            Stock.orderedItems.push(symbol);
                            $('#boardData').append(Stock.board.drawRow(Stock.securities[symbol], count));
                            count++;
                        }
                    }
                });
            }
        }
        else {
            //Neu la theo dang nhom VN30, HNX30
            if (Stock.securities[value] && typeof (Stock.securities[value]) !== 'undefined') {
                if (Stock.board.checkTopSymbols(Stock.securities[value].symbol) === 0) {
                    Stock.orderedItems.push(Stock.securities[value].symbol);
                    $('#boardData').append(Stock.board.drawRow(Stock.securities[value], 0));
                }
            }
        }

        if (AV.Options.orderDir && AV.Options.orderingColumn) {
            Stock.orderedItems.sort(Stock.Board.prototype.columnOrder);
        }
    },
    selectClick: function() {
        console.log('click');
    },
    queryFilter: function(item){
        var that = this;
        console.log($(item).attr('value'));
        $.ajax({
            type: 'POST',
            url: 'https://algoplatform.vn/pbapi/api/filter',
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            headers: {
                'X-TOKEN': AV.StockBoard.token,
                'Content-type': 'application/x-www-form-urlencoded'
            },
            data: { postData: item.value },
            async: false,
            success: function (response) {
                var data1 = JSON.parse(response.dict.items);
                $.each(data1, function (key, item) {
                    var secList = item.secList.split(';');
                    for (var i = 0; i < secList.length; i++) {
                        that.addSymbol(secList[i]);
                    }
                });
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    }
});