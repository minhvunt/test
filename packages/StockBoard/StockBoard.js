Stock = AV.StockBoard = {
    version: '2.0',
    floor: (location.href.indexOf('HOSE') != -1) ? 'HO' : ((location.href.indexOf('UPCOM') != -1) ? 'UPCOM' : ((location.href.indexOf('HASE') != -1 || location.href.indexOf('HNX') != -1) ? 'HA' : 'HO')), //lưu tên sàn hiện tại, mặc định lúc đầu là vào sàn HOSE
    lastSecurities: {}, //Danh sach cac ma thay doi
    localhost: (location.host.search('localhost') != -1), //|| location.host.search('203.162.1.58')!=-1
    isAuto: (location.host.search('listID') != -1),
    listData: [],
    acceptKeypress: true, //Tim kiem theo go~ phim
    volumns: {}, //Khoi luong cua UPCOM
    marketStatus: '', // lưu trạng thái thị trường,
    serverTime: (new Date()).getTime(), // lưu giờ hệ thống
    href: '', //Link vao tung ma chung khoan
    accountHref: '',
    homeUrl: 'algoplatform.vn', //Link trang chu
    dataURL: 'data/', //Thu muc file
    indexes: [[], [], [], [], []], //Mang luu du lieu Index
    oldIndexes: [[], [], [], [], []], //Mang luu du lieu Index cu
    securities: false, //Danh sach ma chung khoan,
    symbols: false,
    orderedItems: false, //Danh sach order
    nextFile: '', //File du lieu tiep theo
    tryCount: 0,
    tryMax: 10,
    time: new Date(),
    refreshRate: 1000, //tan so refresh data
    isProccessing: false, //Bien the hien co dang xu ly du lieu khong
    processCount: 0,
    currentTab: 'HO', //Tab hien tai
    layout: 'ALGO', //Layout mau
    specialSymbols: ['▲', '▼', '■', '     ', '▲', '▼'],   //['mui ten len', 'mui ten xuong','dung yen']
    allSymbols: {}, //{'FPT':[1,54,52,50,"CTCP Vien thong FPT"],'SSI':[..],...} // lưu tất cả các mã chứng khoán đang có cug tt cơ bản
    requestInterval: false,
    marketInterval: false,
    oldBgObj: false,
    statusWindow: false,
    statusWindowHeader: false,
    favouriteItems: [],
    alertItems: [],
    nextTime: '',
    nextProfile: '',
    nextPage: '',
    currentSchedule: '',
    currentSymbol: '',
    chartInterval: 0,
    staticInterval: 0,
    companies: [],
    token: '',
    init: function() //Khoi tao bang gia
    {
        var that = this;        

        $.ajax({
			type: "GET",
			url: Stock.dataFileName('autocomplete'), 
			cache: false,
			async: true,
			success: function (data) {
			    var companyData = data.split('|');
                for (var i = 0; i < companyData.length; i++) {
                    var d = new Object();
                    d.value = $.trim((companyData[i].indexOf('-') == -1) ? companyData[i].toUpperCase() : companyData[i].substr(0, companyData[i].indexOf('-'))).toUpperCase();
                    d.label = companyData[i];
                    d.data = new Object();
                    d.data.ma = d.value;
                    d.data.ten = companyData[i].substr(companyData[i].indexOf('-') + 2);
                    AV.StockBoard.companies.push(d);
                }
                console.log(AV.StockBoard.companies);
			}
        });

        //Lay Token
        $.ajax({
            type: "GET",
            url: 'https://algoplatform.vn/pbapi/api/getToken',
            cache: false,
            async: false,
            success: function (data) {
                that.token = data;

                //Login
                $.ajax({
                    type: 'POST',
                    url: 'https://algoplatform.vn/pbapi/api/login',
                    contentType: "application/json; charset=utf-8",
                    dataType: 'json',
                    headers: {
                        'X-TOKEN': that.token,
                        'Content-type': 'application/x-www-form-urlencoded'
                    },
                    data: { postData: '{"user":"kphan","pass":"bypass"}' },
                    async: false,
                    success: function (response) {
                        console.log(response);
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        console.log(errorThrown);
                    }
                });    
            }
        });

        this.indexes = ['VNALL;;;;;;;;;;;;;;', 'VNIndex-1;;;;;;;', 'VNIndex-2;;;;;;;', 'VNIndex-3;;;;;;;', 'VNIndex-PT;;;;;;;', 'VN30;;;;;;;;;;;;;;', 'VN100;;;;;;;;;;;;;;', 'VNMID;;;;;;;;;;;;;;', 'VNSML;;;;;;;;;;;;;;', 'HNXLCap;;;;;;;;;;;;;;;', 'HNXMSCap;;;;;;;;;;;;;;', 'HNXFin;;;;;;;;;;;;;;', 'HNXCon;;;;;;;;;;;;;;', 'HNX30;;;;;;;;;;;;;;', 'HNXFFIndex;;;;;;;;;;;;;;', 'HNXIndex;;;;;;;;;;;;;;', 'HNXMan;;;;;;;;;;;;;;', 'HNXUpcomIndex;;;;;;;;;;;;;;'];

        if (location.href.indexOf('HOSEPT') !== -1 || location.href.indexOf('HASEPT') !== -1 || location.href.indexOf('HNXPT') !== -1) {
            Stock.currentTab = 'put-through-block';
            AV.Options.showTopPT = true;
        }

        //that.getBasicInfo();//lay thong tin ma co phieu + gia tham chieu, tran, san	
        if (!this.marketInterval)
        {
            this.marketInterval = setInterval(function () {
                if (Stock.isMarketClose()) //Neu la thi truong dong cua
                {
                    $.ajax({
                        type: "GET",
                        url: Stock.dataFileName(Stock.localhost ? '' + Stock.nextFile : 'market'), //Lay lai cac file market chu khong can load cac file khac nua
                        cache: false,
                        async: true,
                        success: function (data) {
                            //data = data.split('@');
                            //QuangNN - 5/4/2010 Neu la ngoai gio
                            if (location.href.indexOf('localhost') !== -1) {
                                stock.serverTime = new Date().getTime();
                            }

                            if (data && data !== Stock.marketStatus) {
                                Stock.marketStatus = data;
                                Stock.reinit(); //Neu co market thay doi thi load lai bang gia
                            }
                            else {
                                var date = new Date();
                                if (date.getHours() === 8 && (date.getMinutes() >= 29 || date.getMinutes() <= 30)) {
                                    Stock.reinit(); //Neu market khong doi nhung nam trong khoang 8h29 ->8h30 thi cung tu load lai
                                }
                            }
                        }
                    });
                }
            }, 10000); // Chu ky 10s/1 request market
        }
    },
    changeFontStyle: function (style) {

        if (style === 'boldAll') {
            $('.stockBoard, #stockBoard').css('font-weight', 'normal');
        } else if (style === 'normal') {
            $('.stockBoard').css('font-weight', 'bold');
            this.addRule('.mainColumn span', 'font-weight:bold')
        } else {
            $('.stockBoard').css('font-weight', 'normal');
            this.oldFontCssIndex = this.addRule('.mainColumn', 'font-weight:bold');
            this.addRule('.mainColumn span', 'font-weight:bold')
        }
        $('input[name=fontStyle][value=' + style + ']').attr('checked', 'checked');
    },

    addRule: function(name, value) {
        try {
            if (typeof (this.oldCssIndexes[name]) !== 'undefined') {
                document.styleSheets[1].deleteRule(this.oldCssIndexes[name]);
            }
            try {
                if (document.styleSheets[1] && document.styleSheets[1].cssRules && document.styleSheets[1].cssRules.length) {
                    this.oldCssIndexes[name] = document.styleSheets[1].cssRules.length;
                    return document.styleSheets[1].insertRule(name + '{' + value + '}', this.oldCssIndexes[name]);
                }
            }
            catch (e) {
            }
        }
        catch (e) {
        }
    },

    ready: function() {
        if (!this.isRunReady) {
            this.isRunReady = true;
            $(document).keypress(function(e) {
                if (Stock.acceptKeypress) {
                    if (e.which === 32 || (65 <= e.which && e.which <= 65 + 25) || (97 <= e.which && e.which <= 97 + 25)) {
                        $("#boardData tr").removeClass("keypress");
                        if (Stock.keypressTimeout) {
                            clearTimeout(Stock.keypressTimeout);
                        }
                        Stock.keypressTimeout = setTimeout(function() {
                            Stock.deleteKeySymbols();
                            Stock.keypressTimeout = false;
                        }, 1000);
                        Stock.pressKeySymbols(String.fromCharCode(e.which));
                    }
                }
            });

            $(document).click(function() {
                if (!Stock.isShowMenu) {
                    $('#board-menu').hide();
                    $('#sub-menu,.sub-menu').hide();
                    $('#sub-menu1,.sub-menu1').hide();
                    var module = $AV('StockBoard.Options');
                    if (module) module.close();
                }
                Stock.isShowMenu = false;
            });

            AV.resize(function() {
                var root = document.compatMode == 'BackCompat' ? document.body : document.documentElement;
                var isHorizontalScrollbar = document.body.style.overflowY != 'hidden' && document.body.style.overflow != 'hidden' && (root.scrollWidth > root.clientWidth);

                //var scrollHeight = (!$.browser.msie && isHorizontalScrollbar) ? 18 : 0;
                var scrollHeight = 18;
                //if ($.browser.ie6) {
                //    $('#ads-block').css('top', (parseInt($(document).scrollTop()) - scrollHeight - Stock.adsHeight + AV.clientHeight()) + 'px');
                //}
                //else {
                    $('#ads-block').css('top', (AV.clientHeight() - scrollHeight - Stock.adsHeight) + 'px');
                //}
                //Stock.resize();
            });

            $(window).scroll(Stock.showFixHeader);
            if (Stock.currentTab !== 'put-through-block' && (AV.Options.tableType[Stock.floor] === 'infinite' || AV.Options.tableType[Stock.floor] === 'pageReplace')) {
                $('body').css('overflow', 'hidden');
            }

            setInterval(function() {
                if (AV.Options.showTopReport) {
                    var favourite = $AV('StockBoard.Top');
                    if (favourite) {
                        $AV('StockBoard.Top').update();
                    }
                }
            }, 10000);
        }

        $('#choose-symbols-block').click(function(event) {
            event.stopPropagation();
            //event.preventDefault();
        });
        var root = document.compatMode == 'BackCompat' ? document.body : document.documentElement;
        var isHorizontalScrollbar = document.body.style.overflowX != 'hidden' && document.body.style.overflow != 'hidden' && (root.scrollWidth > root.clientWidth);

        //var scrollHeight = (!$.browser.msie && isHorizontalScrollbar) ? 18 : 0;
        var scrollHeight =18 ;
        //if (!$.browser.msie || parseInt($.browser.version) >= 7) {
            $('#fix-header-block').css({ position: 'fixed' });
        //}
    },

    reinit: function() //Ham load lai bang gia
    {
        if (!Stock.localhost) {
            setTimeout(function() {
                location.reload();
            }, 15000);
            return;
        }
        if (Stock.isProccessing) {
            setTimeout(Stock.reinit, 100);
            return;
        }
        Stock.isProccessing = true;
        $('.stockBoard tbody td,.stockBoard tbody th').each(function() {
            var color = this.style.backgroundColor;
            if (color !== '') {
                if (AV.App.hightlightColor === 'revert') {
                    if (this.style.color !== 'white') {
                        this.style.color = color;
                        this.style.backgroundColor = '';
                    }
                }
                else {
                    this.style.backgroundColor = '';
                }
            }
        });

        $.ajax({ type: "GET",
            url: Stock.dataFileName('0' + (Stock.localhost ? ('-' + Stock.nextFile) : '')),
            cache: false,
            async: false,
            success: function(data) {
                var stock = Stock;
                for (var i = 0; i < 3; i++) {
                    $('#ptt' + i + ' tbody tr').remove();
                }
                stock.parseStockData(data, 2);
                $('.stockBoard tbody td,.stockBoard tbody th').each(function() {

                    var color = this.style.backgroundColor;
                    if (color != '') {
                        if (AV.App.hightlightColor == 'revert') {
                            if (this.style.backgroundColor) {
                                this.style.color = color;
                                this.style.backgroundColor = '';
                            }
                        }
                        else {
                            this.style.backgroundColor = '';
                        }
                    }
                });

                stock.isProccessing = false;
            },
            complete: function() {

                Stock.isProccessing = false;
            }
        });
    },
    dataFileName: function(fn) {
        var fileName = 'HO';
        if (this.floor == 'DOUBLE') fileName = 'HO';
        return (location.host.search('localhost') != -1) ? Stock.dataURL + fileName + '/' + fn + '.txt' : '../../../' + fileName + '.ashx?FileName=' + fn;
    },

    getMarketStatusHeader: function() {
        if (Stock.floor === 'DOUBLE') {
            return Lang.continuousMatching;
        }
        switch (Stock.marketStatus) {
            case 'K':
            case '':
            case 'C':
            case 'Z':
            case '13':
            case '15':
            case 'G':
            case 'J':
            case '2':
                return Lang.marketClose;
            case 5:
            case '5':
                return Lang.MARKET_STATUS_OPEN;
            case '30':
            case 'P':
            case 'A':
                return Lang.predict;
            case 'O':
            case '1':
            case 1:
                return Lang.matching;
            case 10:
            case '10':
                return Lang.matching;
			case 'LIS_PTH_P_NML_1':
			case 'LIS_PTH_P_NML_13':
			case 'LIS_PTH_P_NML_97':
			case 'LIS_PLO_NEW_1':
			case 'LIS_PLO_NEW_13':
			case 'LIS_PLO_NEW_97':
				return Lang.MarketAfterClose;
        }
        return Lang.continuousMatching;
    },

    getInitDataSuccess: function(total) {
        var stock = Stock;

        stock.parseStockData(total, 1);

        if (!Stock.isMarketClose() && stock.timeData) {
            var days = stock.timeData.split('/');
            stock.serverTime = Date.parse(days[1] + '/' + days[0] + '/' + days[2]);
            setTimeout(function() {
                setTimeout(function() {
                    Stock.requestInterval = setInterval(Stock.requestStock, Stock.refreshRate);
                }, 10);
            }, 10);
        }
        else {
            stock.serverTime = new Date().getTime();
        }

        if (Stock.currentTab != 'put-through-block') {
            AV.ExecQueue.add(function() { Stock.board.initScrollTable(); }, function() { return Stock.board; });
        }

        if (Stock.currentTab != 'put-through-block') {
            if (!Stock.board || $('#boardData tr').length == 0 || AV.sizeof(Stock.allSymbols) == 0) {
                AV.ExecQueue.add(function() {
                    if (AV.Options.orderingColumn) {
                        AV.StockBoard.board.order(AV.Options.orderingColumn);
                    }
                    Stock.board.drawContent();
                    Stock.drawFixHeader();
                    Stock.ready();
                }, function() { return Stock.board && AV.sizeof(Stock.allSymbols) > 0 && $('#boardData').length > 0; });
            }
            else {
                if (AV.Options.orderingColumn) {
                    AV.StockBoard.board.order(AV.Options.orderingColumn);
                }
                Stock.board.drawContent();
                Stock.drawFixHeader();
                Stock.ready();
            }
        }

        try {
            Stock.setDate(Stock.serverTime);
            Stock.setTime(Stock.serverTime);
            Stock.setMarketStatus(Stock.getMarketStatus());
        }
        catch (e) {
            console.log(e);
        }

        if (!Stock.board || $('#boardData tr').length == 0) {
            AV.ExecQueue.add(function() {
                if (AV.Options.showTopReport) {
                    AV.dialog('StockBoard.Top');
                }
            }, function() {
                return $('#Dialog-StockBoard-Top').length;
            });
        }
        AV.ExecQueue.add(function() {
            AV.dialog('StockBoard.Favourite.AddItem');
        }, function() {
            return $('#Dialog-StockBoard-Favourite-AddItem').length;
        });

        AV.ExecQueue.add(function() {
            AV.dialog('StockBoard.Watch');
        }, function() {
            return $('#Dialog-StockBoard-Watch').length;
        });

        AV.App.isReady = true;
    },

    setDate: function(serverTime) {
        try {
            var date = new Date(serverTime);
            var txt = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
            $('#serverDate').html(txt);
        }
        catch (e) {
            console.log(e);
        }
    },
    setTime: function(serverTime) {
        var date = new Date(serverTime);
        $('#serverTime').html(Stock.twoDigit(date.getHours()) + ':' + Stock.twoDigit(date.getMinutes()) + ':' + Stock.twoDigit(date.getSeconds()));
    },

    twoDigit: function(n) {
        if (n < 10) {
            return '0' + n;
        }
        return n;
    },

    updateTime: function() {
        if (Stock.serverTime) {
            var date = new Date(Stock.serverTime);
            $('.hour').html(Stock.twoDigit(date.getHours()) + ':' + Stock.twoDigit(date.getMinutes()) + ':' + Stock.twoDigit(date.getSeconds()));
        }
    },

    setMarketStatus: function(marketStatus) {
        //Xu ly TTTT		
        $('#marketStatus').html(marketStatus);
    },

    getInitData: function() {
        $.ajax({ type: "GET",
            url: Stock.dataFileName('0' + (Stock.localhost ? ('-' + Stock.nextFile) : '')),
            cache: false,
            async: true,
            success: Stock.getInitDataSuccess
        });
    },

    parseStockData: function(data, init) { //Ham nay dung de xu ly du lieu lay ve init=1,2
        /**
        * 0 time
        * 1 market
        * 2 indexes
        * 3 securities
        * 4 putThroughtBuy
        * 5 putThroughtTransaction
        * 6 putThroughtSale
        * 7 lastFile
        */
        var stock = Stock;
        var board = Stock.board;
        //console.log(data);
        data = data.split('@');
        if (data[0]) {
            stock.timeData = data[0];
            var days;
            if (stock.timeData.indexOf('/') > -1)
                days = stock.timeData.split('/');
            else
                days = stock.timeData.split('-');

            stock.serverTime = Date.parse(days[1] + '/' + days[0] + '/' + days[2]);
            Stock.setDate(Stock.serverTime);
            Stock.setTime(Stock.serverTime);

            if (location.host.search('localhost') != -1) {
                stock.serverTime = new Date().getTime();
            }

            if (stock.statusWindow && stock.statusWindow.setTime) { //Cap nhat thoi gian o day
                Stock.statusWindow.setTime(Stock.serverTime);
                Stock.statusWindow.setTimeClassName();
            }

            if (stock.statusWindowHeader && Stock.statusWindowHeader.setTimeHeader) { //Cap nhat thoi gian o day
                Stock.statusWindowHeader.setTimeHeader(Stock.serverTime);
                Stock.statusWindowHeader.setTimeClassName();
            }
        }

        if (data.length) stock.nextFile = data[data.length - 1];
        if (data[1]) {
            if (data[1] != '' && data[1] != ' ' && data[1] != stock.marketStatus) {
                //console.log(data[1] + ' --- ' + stock.marketStatus);
                stock.marketStatus = data[1];
                if (!init) {
                    //Neu la dang chay thi khi chuyen phien se tu dong refresh
                    Stock.reinit();
                    return;
                }
            }
        }

        if (data[2]) {
            stock.indexRawData = data[2];
            if (stock.index) {
                setTimeout(function() { Stock.index.parseData(); }, 10);
            }
            else {
                AV.ExecQueue.add(function() { Stock.index.parseData(); }, function() { return Stock.index; });
            }
        }
        else if (init == 1) {
            stock.indexRawData = 'VNIndex|VNIndex-1|VNIndex-2|VNIndex-3|VNIndex-PT|VN30|VN100|VNSML|VNMID|VNALL|HNXLCap|HNXMSCap|HNXFin|HNXCon|HNX30|HNXFFIndex|HNXIndex|HNXMan|HNXUpcomIndex|';
            AV.ExecQueue.add(function() { Stock.index.parseData(); }, function() { return Stock.index; });
        }
        else {
            setTimeout(Stock.index.drawIndex, 20);
        }

        if (Stock.currentTab != 'put-through-block') {
            if (data[3]) {
                var securities = data[3].split('|');
            }
            else {
                var securities = [];
            }
            if (init == 1) {
                if (stock.orderedItems) {
                    delete stock.orderedItems;
                }
                stock.orderedItems = [];
                if (stock.securities) {
                    delete stock.securities;
                }
                stock.securities = {};

                //Neu la luot load dau tien, lay ra cac ma dang theo doi o DOUBLE
                /*
                if(AV.Options.showSymbols['DOUBLE'] && typeof(AV.Options.showSymbols['DOUBLE']) != 'undefined'){
                $.each(AV.Options.showSymbols['DOUBLE'], function( symbol, value ) {
                if(value || parseInt(value) == 1){
                stock.orderedItems.push(symbol);
                }
                });	
                }
                */
            }

            for (var i in securities) {
                var security = securities[i];
                if (security == '') continue;

                try {
                    var pos = security.indexOf(';');
                    var symbol = security.substr(0, pos);
                    var items = security.substr(pos);
                    var stockSecurity = stock.securities[symbol];

                    if (!init) {

                        if (stockSecurity) {
                            if (!stockSecurity.hightlight) {
                                //Khoi tao lai highlight neu chua co
                                stockSecurity.hightlight = [];
                                for (var i = 1; i <= 39; i++) {
                                    stockSecurity.hightlight[i] = '';
                                }
                            }

                            if (stock.allSymbols[symbol]) {


                                items = items.split(';');
                                for (var j = 0, length = items.length; j < length; j++) {
                                    try {
                                        if (items[j]) {
                                            var values = items[j].split(':');
                                            if (values.length >= 2) {
                                                stock.lastSecurities[symbol] = 1;
                                                var changeCol = parseInt(values[0]);
                                                var changeValue = values[1];
                                                //Thay doi noi dung
                                                stockSecurity.prices[changeCol] = changeValue;
                                                //Danh dau de nhay mau                                                
                                                stockSecurity.hightlight[changeCol] = 1;

                                                stock.updateSecurityStatusWithCol(stockSecurity, changeCol);
                                            }
                                            else {
                                                console.log(values);
                                            }
                                        }
                                    }
                                    catch (err) {
                                        console.log(err);
                                    }
                                }
                            }
                        }
                    }
                    else {
                        var oldPrices = stock.securities[symbol] ? stock.securities[symbol].prices : [], prices = items.split(';');
                        stock.securities[symbol] = {
                            lastTradeStatuses: [],
                            symbol: symbol,
                            hightlight: [],
                            oldHightLight: [],
                            prices: prices
                        };
                        if (init == 2) {
                            var isChange = false;
                            for (var j = 0; j < prices.length; j++) {
                                if (prices[j] != oldPrices[j] || ((prices[j] == '' || Math.round(prices[j]) == 0) && j % 2 == 1)) {
                                    isChange = true;
                                    stock.securities[symbol].hightlight[j] = 1;
                                }
                            }
                            if (isChange) {
                                stock.lastSecurities[symbol] = 1;
                            }
                        }

                        stock.updateSecurityStatus(stock.securities[symbol]);
                        if (board)
                            setTimeout(function() {
                                board.updateRow(stockSecurity);
                            }, 0);
                    }
                }
                catch (err) {
                    console.log(err);
                }
            }
        }
    },

    updateSecurityStatus: function(security) {
        if (!security.tradeStatuses) security.tradeStatuses = [];
        var stock = Stock, prices = security.prices, stockInfo = Stock.allSymbols[security.symbol], tradeStatuses = security.tradeStatuses;
        if (!stockInfo) return;
        //Load lan dau tien
        security.status = (prices[8] == 0 && prices[7] == 0) ? 'ss-basic' : getState(prices[8], stockInfo[1], stockInfo[2], stockInfo[3], 8);
        //QuangNN 25/03/2010
        security.arrowIcon = (prices[7] > 0 && prices[8] == stockInfo[1]) ? stock.specialSymbols[4] : (prices[7] < 0 && prices[8] == stockInfo[2]) ? stock.specialSymbols[5] : (prices[7] < 0) ? stock.specialSymbols[1] : (prices[7] > 0) ? stock.specialSymbols[0] : stock.specialSymbols[2];
        if (AV.App.changeColor == 'priceOnly') {
            //QuangNN - 24/03/2010
            security.arrowIcon = (security.status == 'ss-ceil') ? '' : ((security.status == 'ss-floor') ? '' : security.arrowIcon);
        }
        /*
        if (AV.App.highlightwithStatus) {
        var a = AV.App.highlightwithStatus.split(',');
        for (var k in a) {
        if (AV.App.disableHighlight) {
        tradeStatuses[a[k]] = security.status;
        }
        }
        }
        else
        tradeStatuses[0] = tradeStatuses[7] = tradeStatuses[8] = tradeStatuses[9] = tradeStatuses[10] = tradeStatuses[20] = security.status;
        */
        for (var i in prices) {
            if (Math.abs(prices[i]) < 0.001) {
                prices[i] = 0;
            }

            if (i == 1 || i == 3 || i == 5 || i == 11 || i == 13 || i == 15 || i == 18 || i == 28 || i == 30 || i == 19 || i == 39) //Cac o gia'
            {
                tradeStatuses[i] = getState(prices[i], stockInfo[1], stockInfo[2], stockInfo[3], i);
                if (i < 17 || AV.Options.volColor || i == 28 || i == 30) {
                    tradeStatuses[parseInt(i) + 1] = tradeStatuses[i];
                }

                if (i == 5 || i == 11) {
                    if (prices[i] == '0' || prices[i] == 'ATO' || prices[i] == 'ATC') {
                        tradeStatuses[i] = tradeStatuses[i + 1] = 'ss-no';
                    }
                }
            }
            else if (i == 2 || i == 4 || i == 6 || i == 12 || i == 14 || i == 16 || i == 29 || i == 31) //Cac o khoi luong
            {
                tradeStatuses[i] = getState(prices[i - 1], stockInfo[1], stockInfo[2], stockInfo[3], i);

                if (i == 6 || i == 12) {
                    if (prices[i - 1] == '0' || prices[i - 1] == 'ATO' || prices[i - 1] == 'ATC') {
                        tradeStatuses[i] = 'ss-no';
                    }
                }
            }
            else if (i == 32 || i == 33 || i == 35 || i == 36 || i == 37 || i == 38 || i == 26 || i == 27 || i == 20 || i == 21)
                tradeStatuses[i] = 'ss-no';
            else if (i == 0 || i == 7 || i == 8 || i == 9 || i == 10) {
                tradeStatuses[i] = getState(prices[8], stockInfo[1], stockInfo[2], stockInfo[3], i);
                if (i == 8) { //Neu la gia thay doi, thi thay doi toan bo luon
                    tradeStatuses[0] = tradeStatuses[7] = tradeStatuses[9] = tradeStatuses[10] = tradeStatuses[i];
                }
            }
            else {
                tradeStatuses[i] = getState(prices[i], stockInfo[1], stockInfo[2], stockInfo[3], i);
            }
        }
    },
    updateSecurityStatusWithCol: function(security, col) {
        if (!security.tradeStatuses) security.tradeStatuses = [];
        var stock = Stock, prices = security.prices, stockInfo = Stock.allSymbols[security.symbol], tradeStatuses = security.tradeStatuses;
        if (!stockInfo) return;
        //Load lan dau tien
        security.status = (prices[8] == 0 && prices[7] == 0) ? 'ss-basic' : getState(prices[8], stockInfo[1], stockInfo[2], stockInfo[3], 8);
        //QuangNN 25/03/2010
        security.arrowIcon = (prices[7] > 0 && prices[8] == stockInfo[1]) ? stock.specialSymbols[4] : (prices[7] < 0 && prices[8] == stockInfo[2]) ? stock.specialSymbols[5] : (prices[7] < 0) ? stock.specialSymbols[1] : (prices[7] > 0) ? stock.specialSymbols[0] : stock.specialSymbols[2];
        var i = col;
        if (Math.abs(prices[i]) < 0.001) {
            prices[i] = 0;
        }

        if (i == 1 || i == 3 || i == 5 || i == 11 || i == 13 || i == 15 || i == 17 || i == 18 || i == 19 || i == 28 || i == 30) {
            //Cac o gia
            tradeStatuses[i] = getState(prices[i], stockInfo[1], stockInfo[2], stockInfo[3], i);
            //Khi thay doi gia thi thay doi ca KL luon
            if (i == 1 || i == 3 || i == 5 || i == 11 || i == 13 || i == 15 || i == 28 || i == 30) {
                tradeStatuses[i + 1] = tradeStatuses[i];
            }

            if (i == 5 || i == 11) {
                if (prices[i] == '0' || prices[i] == 'ATO' || prices[i] == 'ATC') {
                    tradeStatuses[i] = tradeStatuses[i + 1] = 'ss-no';
                }
            }
        }
        else if (i == 2 || i == 4 || i == 6 || i == 12 || i == 14 || i == 16 || i == 29 || i == 31) {
            //Cac o KL
            tradeStatuses[i] = tradeStatuses[i - 1];
            if (i == 6 || i == 12) {
                if (prices[i - 1] == '0' || prices[i - 1] == 'ATO' || prices[i - 1] == 'ATC') {
                    tradeStatuses[i] = 'ss-no';
                }
            }
        }
        else if (i == 32 || i == 33 || i == 34 || i == 35 || i == 36 || i == 37 || i == 20 || i == 21 || i == 26 || i == 27) {
            //Cac o NN Mua / Ban, SL Mua/ SL Ban, Room
            tradeStatuses[i] = 'ss-no';
        }
        else if (i == 0 || i == 7 || i == 8 || i == 9 || i == 10) {
            tradeStatuses[0] = tradeStatuses[7] = tradeStatuses[8] = tradeStatuses[9] = tradeStatuses[10] = security.status;
        }
        else {
            tradeStatuses[i] = getState(prices[i], stockInfo[1], stockInfo[2], stockInfo[3], i);
        }
    },
    redraw: function() {
        var that = this;
        this.isDrawSelectSymbolForm = false;

        if (AV.Options.showTopReport) {
            AV.dialog('StockBoard.Top');
        }
        Stock.allowedPos = $("#stockBoard").height() - $("#board-block").height();
    },
    requestStock: function() {
        if (Stock.dashBoard == null) {
            var stock = Stock, marketStatus = stock.marketStatus;

            if (marketStatus == 'K' || marketStatus == 'Z' || marketStatus == '13' || marketStatus == '15') {
                return;
            }
            if (!stock.nextFile || stock.isProccessing) {
                return;
            }
            stock.isProccessing = true;
            var url = stock.dataFileName(stock.nextFile);
            //alert(url);
            if (!stock.xmlHttpReq) {

                // Mozilla/Safari
                if (window.XMLHttpRequest) {
                    stock.xmlHttpReq = new XMLHttpRequest();
                }
                // IE
                else {
                    stock.xmlHttpReq = new ActiveXObject("Microsoft.XMLHTTP");
                }
            }
            //else if ($.browser.msie) {
            //    stock.xmlHttpReq.abort();
            //}
            stock.xmlHttpReq.onreadystatechange = updateStock;
            stock.xmlHttpReq.open('GET', url + ((url.indexOf('?') != -1) ? '&' : '?') + '_t=' + new Date().getTime(), true);
            //stock.xmlHttpReq.setRequestHeader('Content-Type', 'text/plain');
            //if (!$.browser.msie)
                stock.xmlHttpReq.overrideMimeType('text/plain');

            setTimeout(function() {
                Stock.xmlHttpReq.send(null);
                Stock.xmlHttpReq.onreadystatechange = updateStock;
            }, 10);
        }
    },
    getMarketStatus: function(status) {
        var that = this;
        switch (status ? status : that.marketStatus) {
            case 'P':
                return Lang.getOpenMarket;
                break;
            case 'O':
            case 'F':
                return Lang.continueMarket;
                break;
            case '30':
            case 'A':
                return Lang.getCloseMarket;
                break;
            case 'C':
            case '35':
                return Lang.pttMarket;
                break;
            case 5:
            case '5':
            case 1:
            case '1':
                return Lang.continueMarket;
                break;
            case 15:
            case '15':
                return Lang.closeDay;
                break;
            case 10:
            case '10':
                return Lang.BreakTime;			
			case 'LIS_PTH_P_NML_1':
			case 'LIS_PTH_P_NML_13':
			case 'LIS_PLO_NEW_1':
			case 'LIS_PLO_NEW_13':
				return Lang.MarketAfterClose;
            default:
                return Lang.closeDay;
        }
    },
    isMarketClose: function() {
        var marketStatus = this.marketStatus;
        return (marketStatus == 'K' || marketStatus == 'Z' || marketStatus == '13' || marketStatus == '15');
    },
    getBasicInfo: function() {
        $.ajax({ type: "GET",
            url: Stock.dataFileName('ref' + (AV.App.englishRef && (AV.Options.language == 'en' || AV.Options.language == '"en"') ? '_en' : '')),
            cache: false,
            async: false,
            success: function(data) {
                if (data) {
                    var stock = data.split('|');
                }
                else {
                    var stock = [];
                }
                Stock.allSymbols = Stock.proccessReference(stock);
                Stock.getInitData();
            }
        });
    },
    proccessReference: function(stock) {
        var that = this;
        var symbols = {};
        var j;
        for (var i in stock) {
            if (stock[i] != '') {
                var symbol = stock[i].split(';');
                j = i;
                j++
                if (symbol[0] != '') {
                    symbols[symbol[0]] = [j, symbol[1], symbol[2], symbol[3], symbol[4], 0, symbol[5], symbol[5]];
                }
                delete symbol;
            }
        }
        var j = 0;
        var showSymbols = AV.Options.showSymbols[this.floor];
        if (!showSymbols || AV.sizeof(showSymbols) == 0) {
            for (var i in symbols) {
                symbols[i][5] = j++;
            }
        }
        else {
            for (var i in showSymbols)
                if (symbols[i]) {
                symbols[i][5] = j++;
            }
        }
        return symbols;
    },
    getState: function(price, ceil, floor, basic, index) {

        if (price == 'ATC' || price == 'ATO' || parseFloat(price) == 0) {
            if (AV.App.ATOColor)
                return AV.App.ATOColor;
            else
                if (index <= 7) return 'ss-ceil';
            else return 'ss-floor';
        }
        else
            if (Math.abs(price - basic) < 0.001) {
            return 'ss-basic';
        } else {
            if (Math.abs(price - ceil) < 0.001) {
                return 'ss-ceil';
            }
            if (Math.abs(price - floor) < 0.001) {
                return 'ss-floor';
            }
            if (price - basic > 0) {
                return 'ss-up';
            } else {
                return 'ss-down';
            }
        }
    },
    getVolumeState: function(value) {
        if (value != 0 && value != '0' && value != '') {
            if (value < 100) { return 'ss-no'; }
            else if (value < 150) return 'ss-basic';
            else if (value < 200) return 'ss-up';
            else return 'ss-ceil';
        }
    },
    getOtherState: function(price, ceil, floor, basic, index) {
        if (price == 'ATC' || price == 'ATO' || parseFloat(price) == 0) {
            if (AV.App.ATOColor)
                return 'other-ss-no';
            else
                if (index <= 7) return 'other-ss-ceil';
            else return 'other-ss-floor';
        }
        else
            if (Math.abs(price - basic) < 0.001) {
            return 'other-ss-basic';
        } else {
            if (Math.abs(price - ceil) < 0.001) {
                return 'other-ss-ceil';
            }
            if (Math.abs(price - floor) < 0.001) {
                return 'other-ss-floor';
            }
            if (price - basic > 0) {
                return 'other-ss-up';
            } else {
                return 'other-ss-down';
            }
        }
    },
    getStateColor: function(price, ceil, floor, basic, index) {
        if (price == 'ATC' || price == 'ATO' || parseFloat(price) == 0) {
            if (AV.App.ATOColor)
                return AV.App.colors['ATOColor'];
            else {
                if (index <= 7) return AV.App.colors['ss-ceil'];
                else return AV.App.colors['ss-floor'];
            }
        }
        else if (price > 0) {
            if (Math.abs(price - basic) < 0.001) {
                return AV.App.colors['ss-basic'];
            } else {
                if (Math.abs(price - ceil) < 0.001) {
                    return AV.App.colors['ss-ceil'];
                }
                if (Math.abs(price - floor) < 0.001) {
                    return AV.App.colors['ss-floor'];
                }
                if (price - basic > 0) {
                    return AV.App.colors['ss-up'];
                } else {
                    return AV.App.colors['ss-down'];
                }
            }
        }
    },
    getVolumeStateColor: function(value) {
        if (value != 0 && value != '0' && value != '') {
            if (value < 100) { return AV.App.colors['ss-no']; }
            else if (value < 150) return AV.App.colors['ss-basic'];
            else if (value < 200) return AV.App.colors['ss-up'];
            else return AV.App.colors['ss-ceil'];
        }
    },
    getOtherStateColor: function(price, ceil, floor, basic, index) {
        if (price > 0) {
            if (Math.abs(price - basic) < 0.001) {
                return AV.App.colors['other-ss-basic'];
            } else {
                if (Math.abs(price - ceil) < 0.001) {
                    return AV.App.colors['other-ss-ceil'];
                }
                if (Math.abs(price - floor) < 0.001) {
                    return AV.App.colors['other-ss-floor'];
                }
                if (price - basic > 0) {
                    return AV.App.colors['other-ss-up'];
                } else {
                    return AV.App.colors['other-ss-down'];
                }
            }
        }
    },
    open: function(symbol) {
        //window.open('http://vfpress.vn/?s='+symbol);
        $('#chart-region').css('display', 'block');
        AV.StockBoard.currentSymbol = symbol;
        Stock.board.chartOpen();
        return;
    },
    pressedKeyCode: '',  /*duonghte : lưu mã ASCII các phím đã nhấn trg 1 khoảng thời gian*/
    scrollInterval: '', /*duonghte : interval cua table kiểu cuon*/
    allowedPos: 0,
    blockBoardTopPosition: 0,
    fixHeaderBlockDisplay: 'none',
    visibleRow: 0,
    showFixHeader: function() {
        var pageTop;
        if (typeof window.pageYOffset != 'undefined') {
            pageTop = window.pageYOffset;
        }
        else if (typeof document.compatMode != 'undefined' && document.compatMode != 'BackCompat') {
            pageTop = document.documentElement.scrollTop;
        }
        else if (typeof document.body != 'undefined') {
            pageTop = document.body.scrollTop;
        }
        //if ($.browser.ie6) {
        //    if (!Stock.adsHeight) Stock.adsHeight = $('#ads-block').height();
        //    var root = document.compatMode == 'BackCompat' ? document.body : document.documentElement;
        //    var isHorizontalScrollbar = document.body.style.overflowX != 'hidden' && document.body.style.overflow != 'hidden' && (root.scrollWidth > root.clientWidth);

        //    //var scrollHeight = (!$.browser.msie && isHorizontalScrollbar) ? 18 : 0;
        //    var scrollHeight = 18;
        //    $('#ads-block').css('top', (parseInt(pageTop) - Stock.adsHeight + AV.clientHeight() - scrollHeight) + 'px');
        //}
        if (Stock.currentTab != 'HO' && Stock.currentTab != 'HA' && Stock.currentTab != 'UPCOM') return;

        var pageLeft, pageTop;
        if (typeof window.pageXOffset != 'undefined') {
            pageLeft = window.pageXOffset;
        }
        else if (typeof document.compatMode != 'undefined' && document.compatMode != 'BackCompat') {
            pageLeft = document.documentElement.scrollLeft;
        }
        else if (typeof document.body != 'undefined') {
            pageLeft = document.body.scrollLeft;
        }
        if (typeof window.pageYOffset != 'undefined') {
            pageTop = window.pageYOffset;
        }
        else if (typeof document.compatMode != 'undefined' && document.compatMode != 'BackCompat') {
            pageTop = document.documentElement.scrollTop;
        }
        else if (typeof document.body != 'undefined') {
            pageTop = document.body.scrollTop;
        }

        //$.browser.ie6 && 
        //pageLeft || 
        var vWidth = '0';
        var vLeft = '0';

        if (((typeof (lastPageTop) != 'undefined' && pageTop != lastPageTop))) {
            vWidth = $('#stockBoard').attr('clientWidth') != 0 ? $('#stockBoard').attr('clientWidth') : '100%';
            vLeft = pageLeft * (-1);
            if (vLeft == 0) vWidth = '100%';
            if (AV.Options.screenWidth == 'auto')
                $('#fix-header-block').css({ 'left': vLeft });
            else
                $('#fix-header-block').css({ 'left': 'auto' });

            if (pageTop != 0) {
                if (vWidth > 1020)
                    $('#fix-header-block').css({ 'width': vWidth });
            }
            else {
                if (vWidth > 1020)
                    $('#fix-header-block').css({ 'width': '100%' });
            }
        }
        else {
            if (((typeof (lastPageLeft) != 'undefined' && pageLeft != lastPageLeft))) {
                vWidth = $('#stockBoard').attr('clientWidth') != 0 ? $('#stockBoard').attr('clientWidth') : '100%';
                vLeft = pageLeft * (-1);
                if (vLeft == 0) vWidth = '100%';
                if (pageLeft != 0) {
                    if (vWidth > 1020)
                        $('#fix-header-block').css({ 'left': vLeft, 'width': vWidth });
                }
                else {
                    if (vWidth > 1020)
                        $('#fix-header-block').css({ 'left': vLeft, 'width': '100%' });
                }
            }
        }

        /*
        if (pageLeft > 0)
        $('#sub-menu').css({ 'left': $('#viewCategories').offset().left - pageLeft - 10 });
        else if (pageLeft == 0 && pageTop > 0)
        $('#sub-menu').css({ 'left': $('#viewCategories').offset().left - pageLeft - 150 });
        */
        lastPageLeft = pageLeft;
        lastPageTop = pageTop;

        if (AV.Options.tableType[Stock.floor] == 'normal' && AV.App.headerFloat != '0') {

            if (!Stock.blockBoardTopPosition) {
                Stock.updateElementsPosition();
            }
            var boardPos = Math.max(Stock.blockBoardTopPosition - 5, 0);
            Stock.visibleRow = Math.floor((pageTop - boardPos) / AV.Options.lineHeight);
            if (Stock.visibleRow < 0) Stock.visibleRow = 0;

            if (pageTop > boardPos) {
                //if ($.browser.ie6) {
                //    $('#fix-header-block').css('top', pageTop);
                //}

                if (Stock.fixHeaderBlockDisplay != 'block') {
                    Stock.fixHeaderBlockDisplay = 'block';
                    $('#fix-header-block').show();
                    if (AV.App.indexFloat != '0') {
                        $('#session-info').insertAfter($('#header-logo-slogan'));
                    }
                    if (AV.App.selectedSymbolFloat != '0') {
                        $('#selectedBoardData').appendTo($('#tableFixHeader'));
                    }

                }
            } else {
                if (Stock.fixHeaderBlockDisplay == 'block') {
                    Stock.fixHeaderBlockDisplay = 'none';
                    $('#fix-header-block').hide();
                    if (AV.App.indexFloat != '0') {
                        $('#session-info').insertAfter($('#menutop-content'));
                    }
                    if (AV.App.selectedSymbolFloat != '0') {
                        $('#selectedBoardData').insertBefore($('#boardData'));
                    }
                }
            }
        }
    },
    resize: function() {
        var width = (AV.Options.screenWidth == 'auto' || AV.Options.screenWidth == 'Auto' || AV.Options.screenWidth == '100%') ? (window.innerWidth) : AV.Options.screenWidth;
        var pos = Math.round((width - 123 * 6) / 2);
        $('#home-tab').css('marginLeft', pos + 'px');
        pos = Math.round((width - 500) / 2 - 270);
        if (pos > 0) {

        }
        $('.spag div.supermenu_2').width($('#category').width() - 72);
    },
    drawFixHeader: function() {
        AV.ExecQueue.add(function() {
            $('#tableFixHeader>thead').html($('#sb-hd').html());
        }, function() { return $('#sb-hd').html(); });
    },
    insertRowToStockTBody: function(symbol, tbody) {
        var ok = false;
        tbody.find('tr').each(function() {
            if (Stock.board.columnOrder(this.id.substr(2), symbol) >= 0) {
                console.log(Stock.board.columnOrder(this.id.substr(2), symbol));
                $(this).before($('#tr' + symbol).removeClass('high-light-row'));
                ok = true;
                return false;
            }
        });
        if (!ok) {
            tbody.append($('#tr' + symbol));
        }
    },
    goTopSymbols: function(symbol) {
        if (AV.App.limitSelectedRows && $('#selectedBoardData>tr').length > AV.App.limitSelectedRows) {
            AV.alert(Lang.MaxSelectedRowsExcess);
            return;
        }
        //if ($.browser.msie) {
        //    $('#selectedBoardData>tr').removeClass('lastRow');
        //}
        AV.Options.topSymbols[symbol] = 1;
        AV.Options.save('topSymbols');
        this.insertRowToStockTBody(symbol, $('#selectedBoardData'));
        $('#selectedBoardData').show();
        //if ($.browser.msie) {
        //    $('#selectedBoardData>tr:last').addClass('lastRow');
        //}
        if (typeof (ScrollTableObj) != 'undefined') {
            ScrollTableObj.firstRow = ScrollTableObj.boardData.firstChild;
            ScrollTableObj.hiddenFirstRow = ScrollTableObj.hiddenBoardData.firstChild;
            var hiddenFirstRow = ScrollTableObj.hiddenFirstRow;
            if (hiddenFirstRow) {
                ScrollTableObj.hiddenFirstRow = hiddenFirstRow.nextSibling;
                hiddenFirstRow.isHidden = false;
                ScrollTableObj.boardData.appendChild(hiddenFirstRow);
            }
        }
    },
    goReturnSymbols: function(symbol) {
        if (typeof (AV.Options.topSymbols[symbol]) != 'undefined') {
            //if ($.browser.msie) {
            //    $('#selectedBoardData>tr:last').removeClass('lastRow');
            //}
            delete AV.Options.topSymbols[symbol];
            AV.Options.save('topSymbols');
            this.insertRowToStockTBody(symbol, $('#boardData'));
            if ($('#selectedBoardData>tr').length == 0) {
                $('#selectedBoardData').hide();
            }
            else
            //    if ($.browser.msie) {
            //    $('#selectedBoardData>tr:last').addClass('lastRow');
            //}
            if (typeof (ScrollTableObj) != 'undefined') {
                ScrollTableObj.firstRow = ScrollTableObj.boardData.firstChild;
                ScrollTableObj.hiddenFirstRow = ScrollTableObj.hiddenBoardData.firstChild;
            }
        }
    },
    pressKeySymbols: function(pressedKeyCode) { /*duonghte : ham focus den cac ma CK thoa khop voi phim dang nhan*/
        Stock.pressedKeyCode += pressedKeyCode;
        var chars = Stock.pressedKeyCode.toUpperCase();
        var obj = $("#boardData tr").find("th[id^='" + chars + "']").parent().get(0);
        if (typeof obj != 'undefined') {
            var rid = obj.id;
            $("#" + rid).addClass("keypress");
            setTimeout(function() {
                $("#" + rid).removeClass("keypress");
            }, 2000);

            if (AV.Options.tableType[Stock.floor] == "normal") {
                //$('#fix-header-block').css('display','block');
                var abc = $("#" + rid).position().top - $('#fix-header-block').height() - 10 * $("#" + rid).height();
                console.log(abc);
                if (abc < 0) abc = 0;
                $(window).scrollTop(abc);
            }
        }
        else {
            if (AV.Options.tableType[Stock.floor] == "normal") {
                var abc = $('#fix-header-block').height();
                $(window).scrollTop(abc);
            }
        }
    },
    deleteKeySymbols: function() { /*duonghte */
        Stock.pressedKeyCode = "";
    },
    scrollTable: function(delay, inc) {
        if (!Stock.contentReady) {
            setTimeout(function() { Stock.scrollTable(delay, inc) }, 1000);
            return;
        }
        var options = AV.Options;
        if (inc == 100) {
            inc = options.lineCount * $('#boardData tr:first').height();
        }

        if ((!options.showSymbols[Stock.floor] && parseInt(AV.sizeof(Stock.allSymbols)) > parseInt(options.lineCount)) || parseInt(AV.sizeof(options.showSymbols[Stock.floor])) > parseInt(options.lineCount)) {
            if (AV.App.fixedSelections) {
                $('#selectedBoardData').insertAfter($('#tableFixHeader thead'));
            }
            location = '#';

            $("#board-block").addClass('scrollTable');
            $("#board-block").height(AV.Options.lineCount * AV.Options.lineHeight);

            Stock.allowedPos = $("#stockBoard").height(); // - AV.Options.lineCount*AV.Options.lineHeight;
            $("#divFixHeader").css({ 'display': 'none' });
            $("#fix-header-block").css({ position: "static", 'display': 'block' });
            $('#sb-hd').hide();
            ScrollTableObj = {
                pos: 0,
                boardElem: document.getElementById('board-block'),
                allowedPos: Stock.allowedPos,
                inc: inc,
                $hiddenBoardData: $('#hiddenBoardData'),
                hiddenBoardData: document.getElementById('hiddenBoardData')
            };
            if (AV.App.fixedSelections && ScrollTableObj.$hiddenBoardData.length > 0 && inc == 1) {
                ScrollTableObj.inc = 1;
                ScrollTableObj.$boardData = $('#boardData');
                ScrollTableObj.boardData = document.getElementById('boardData');

                ScrollTableObj.$boardData.find('tr').each(function(i) {
                    if (i == 0) {
                        ScrollTableObj.lineHeight = $(this).height();
                    }
                    else if (i > parseInt(AV.Options.lineCount) + 10) {
                        if (!ScrollTableObj.hiddenFirstRow) {
                            ScrollTableObj.hiddenFirstRow = this;
                        };
                        this.isHidden = true;
                        ScrollTableObj.$hiddenBoardData.append(this);
                    }
                });

                ScrollTableObj.firstRow = ScrollTableObj.$boardData.get(0).firstChild;

                setTimeout(function() {
                    $(ScrollTableObj.boardElem).height($('#stockBoard').height() - ScrollTableObj.lineHeight * 10);
                }, 100);
                Stock.scrollInterval = setInterval(scrollInfiniteFunc, delay);
            }
            else {

                Stock.scrollInterval = setInterval(scrollFunc, delay);
            }
        }
        else {
            //alert('fail');
        }
    },
    destroyScrollTable: function() {
        if (Stock.scrollInterval) {
            clearInterval(Stock.scrollInterval);
            Stock.scrollInterval = false;
        }
        $("#board-block").removeClass('scrollTable');
        $("#board-block").css('height', 'auto');
        $("#sb-hd").show();
        $("#scrollFixHeader").css("display", "none");
        $("#fix-header-block").css("display", "none");
    },
    toggleDataColumn: function() {

    },
    updateElementsPosition: function() {
        var obj = $('#stockBoard');
        if (obj.length > 0) {
            Stock.blockBoardTopPosition = obj.position().top;
            Stock.fixHeaderBlockDisplay = $('#fix-header-block').css('display');
        }
    },
    checkNum: function(e) {
        var keynum
        var keychar
        var numcheck
        if (window.event) // IE
        {
            keynum = e.keyCode
        }
        else if (e.which) // Netscape/Firefox/Opera
        {
            keynum = e.which
        }
        if ((keynum >= 48 && keynum <= 57) || (keynum == 8)) {
            return true;
        }
        else {
            return false;
        }
    },
    weightFormat: function(number) {
        var s = 1;
        if (number == 0 || parseFloat(number) == 0)
            return '';
        if (AV.App.Unit[Stock.floor] && parseInt(AV.App.Unit[Stock.floor]) > 1) { s = parseInt(AV.App.Unit[Stock.floor]); number = number / s; }
        return AV.numberFormat(parseInt(number));
    },
    SBSweightFormat: function(number) {
        return number;
        number = number / 100;
        var value = parseFloat(number) > 1000 ? AV.numberFormat(parseInt(number)).toString() : AV.numberFormat(number);
        return value;
    },
    setLanguage: function(lang) {
        AV.Options.save('language', lang);
        location.reload();
    },
    orderArrow: function(index) {
        if (index == AV.Options.orderingColumn) {
            return (AV.Options.orderDir == 1) ? ' ▲' : ' ▼';
        }
        return '';
    },
    resetSettings: function() {
        for (var i in AV.Options.definitions) {
            AV.Options[i] = AV.Options.definitions[i];
        }
        AV.Options.save();
        location.reload();
    },
    diff: function(x) {
        if (!x) return x;
        if (AV.App.diffType == 'absolute') {
            return Math.abs(x);
        }
        else if (AV.App.diffType == 'sign') {
            return ((x > 0) ? '+' : '') + x;
        }
        else {
            return x;
        }
    },
    getExtraInfo: function(symbol) {
        if (!Stock.allSymbols[symbol] || !Stock.allSymbols[symbol][7]) return '';
        var items = (Stock.allSymbols[symbol][7] + '').split(','), content = '';
        for (var i = 0; i < items.length; i++) {
            if (Lang['StockInfo_' + items[i]]) {
                content += Lang['StockInfo_' + items[i]] + '. ';
            }
        }
        return content;
    },
    getExtraInfoIcon: function(symbol) {
        if (!Stock.allSymbols[symbol] || !Stock.allSymbols[symbol][7]) return '';
        var items = (Stock.allSymbols[symbol][7] + '').split(','), content = '';
        var check = false;
        for (var i = 0; i < items.length; i++) {
            if (Lang['StockInfo_' + items[i]]) {
                if (!check)
                    content += '(*)';
                check = true;
            }
            if (Lang['StockInfoHaltIcon_' + items[i]]) {
                content += Lang['StockInfoHaltIcon_' + items[i]];
            }
        }
        return content;
    },
    getExtraInfoBgColor: function(symbol) {
        if (!Stock.allSymbols[symbol] || !Stock.allSymbols[symbol][7]) return '';
        var items = (Stock.allSymbols[symbol][7] + '');
        if (items.indexOf('A') != -1) return 'blue';
        if (items.indexOf('D') != -1) return '#00E138';
        return '#90C';
    }
};
getState = Stock.getState;
getVolumeState = Stock.getVolumeState;
getOtherState = Stock.getOtherState;
getStateColor = Stock.getStateColor;
getVolumeStateColor = Stock.getVolumeStateColor;
getOtherStateColor = Stock.getOtherStateColor;
function scrollFunc() {
    var scrollTable = ScrollTableObj;
    var pos = scrollTable.pos;
    pos = pos + scrollTable.inc;
    Stock.visibleRow = Math.floor(pos / AV.Options.lineHeight);
    scrollTable.pos = pos;
    if (pos >= scrollTable.allowedPos) {
        if (pos > scrollTable.allowedPos/* + 5*scrollTable.inc*/) {
            scrollTable.pos = 0;
            pos = 0;
        }
        else {
            return;
        }
    }
    if (scrollTable.boardElem) {
        scrollTable.boardElem.scrollTop = pos;
    }
};
function scrollInfiniteFunc() {
    var scrollTable = ScrollTableObj;
    var pos = scrollTable.pos;
    pos = pos + scrollTable.inc;
    if (pos >= scrollTable.lineHeight * 4) {
        pos = 0;
        for (var i = 0; i < 4; i++) {
            var firstRow = scrollTable.firstRow, hiddenFirstRow = scrollTable.hiddenFirstRow;

            if (scrollTable.firstRow) {
                scrollTable.firstRow = scrollTable.firstRow.nextSibling;
                scrollTable.hiddenBoardData.appendChild(firstRow);
            }
            else {
                scrollTable.firstRow = scrollTable.boardData.firstChild;
            }
            if (scrollTable.hiddenFirstRow) {
                scrollTable.hiddenFirstRow = scrollTable.hiddenFirstRow.nextSibling;
                hiddenFirstRow.isHidden = false;
                scrollTable.boardData.appendChild(hiddenFirstRow);
            }
            else {
                scrollTable.hiddenFirstRow = scrollTable.hiddenBoardData.firstChild;
            }
        }
    }
    scrollTable.pos = pos;
    if (scrollTable.boardElem) {
        scrollTable.boardElem.scrollTop = pos;
    }

};
function updateStock() {
    var stock = Stock;
    if (stock.xmlHttpReq.readyState == 4) {
        if (stock.xmlHttpReq.status == 200 || stock.xmlHttpReq.status == 301) {
            stock.tryCount = 0;
            var data = stock.xmlHttpReq.responseText;

            if (data) {
                stock.parseStockData(data);
            }
        }
        else {
            if (Stock.localhost) {
                clearInterval(Stock.marketInterval);
                clearInterval(Stock.requestInterval);
                return;
            }
            if (stock.tryCount++ >= stock.tryMax) {
                stock.tryCount = 0;
                stock.nextFile = '0';
                stock.reinit();
            }
        }

        var j = 0;

        if (Stock.board) {
            var board = Stock.board, lastSecurities = stock.lastSecurities;
            //console.log(lastSecurities);
            for (var i in lastSecurities) {
                if (lastSecurities[i] > 0) //QuangNN 31/3/2010 - Cac thay doi moi update lai row nay
                {
                    if (stock.securities[i]) {
                        delete lastSecurities[i];
                        board.updateRow(stock.securities[i]);
                        //lazyUpdateRow(i, j++);
                    }
                }
            }
        }

        stock.isProccessing = false;
    }
}
function lazyUpdateRow(i, j, dontChangeBgColor) {
    //setTimeout(function(){
    if (Stock.board) Stock.board.updateRow(Stock.securities[i], dontChangeBgColor);
    //},(parseInt(j)+1)*5);
}

function GetNameOfCategory() {
    if (AV.App.useCategory && Stock.categories) {
        var i = AV.Options['currentCategory_' + Stock.floor];
        if (i <= 0)
            return '';

        var s = '';
        if (AV.Options.language == 'en' || AV.Options.language == '"en"')
            s = 'Category of ';
        else
            s = 'Nhóm ngành ';

        return "(" + s + Stock.categories[i - 1][0] + ")";
    }

    return '';
}

$('.stock-header__navigation').on('click', '.dropdown-menu a', function () {
    $('.nav-tab').removeClass('active');
    $(this).closest('.dropdown').find('.nav-tab').addClass('active');
});

/**
 * Xử lý khi lưu kết quả lọc
 */
$('.filter__buttons').find('button:first').on('click', function () {
    // Save tên bộ lọc.
    var filterName = $('.filter__name input').val();
    if (filterName == '') {
        alert('Xin hãy nhập tên bộ lọc');
        return;
    }
    that.addNewFilter(filterName);

    // Ẩn modal
    that.handleHideModals();

    // Hiển thị kết quả lọc.
    that.showFilterResult();
});