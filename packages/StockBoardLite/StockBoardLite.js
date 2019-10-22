Stock = AV.StockBoardLite = {
    version: '1.0 Lite',
    floor: (location.href.indexOf('DOUBLE') != -1) ? 'DOUBLE' : ((location.href.indexOf('UPCOM') != -1) ? 'UPCOM' : ((location.href.indexOf('HASE') != -1 || location.href.indexOf('HNX') != -1) ? 'HA' : 'HO')), //lưu tên sàn hiện tại, mặc định lúc đầu là vào sàn HOSE
    lastSecurities: {}, //Danh sach cac ma thay doi
    localhost: (location.host.search('localhost') != -1), //|| location.host.search('203.162.1.58')!=-1
    isAuto: (location.host.search('listID') != -1),
    listData: [],
    acceptKeypress: true, //Tim kiem theo go~ phim
    volumns: {}, //Khoi luong cua UPCOM
    marketStatus: '', // lưu trạng thái thị trường,
    serverTime: (new Date()).getTime(), // lưu giờ hệ thống
    href: 'http://www.sbsc.com.vn/viewInvCorporate.do?symbol=', //Link vao tung ma chung khoan
    accountHref: 'http://localhost:83/',
    homeUrl: 'www.sbsc.com.vn', //Link trang chu
    dataURL: 'data/', //Thu muc file
    indexes: [[], [], [], [], []], //Mang luu du lieu Index
    oldIndexes: [[], [], [], [], []], //Mang luu du lieu Index cu
    securities: false, //Danh sach ma chung khoan
    orderedItems: false, //Danh sach order
    nextFile: '', //File du lieu tiep theo
    tryCount: 0,
    tryMax: 10,
    time: new Date(),
    refreshRate: $.browser.msie ? 2000 : 2000, //tan so refresh data
    isProccessing: false, //Bien the hien co dang xu ly du lieu khong
    processCount: 0,
    currentTab: 'HO', //Tab hien tai
    layout: 'SBSC', //Layout mau
    specialSymbols: ['▲', '▼', '<font style="font-size: 16px; line-height: 14px;padding-right:1px">■</font>', '     ', '▲', '▼'],   //['mui ten len', 'mui ten xuong','dung yen']■█
    allSymbols: {}, //{'FPT':[1,54,52,50,"CTCP Vien thong FPT"],'SSI':[..],...} // lưu tất cả các mã chứng khoán đang có cug tt cơ bản
    requestInterval: false,
    marketInterval: false,

    oldBgObj: false,
    statusWindow: false,
    statusWindowHeader: false,
    favouriteItems: [],
    nextTime: '',
    nextProfile: '',
    nextPage: '',
    currentSchedule: '',
    currentSymbol: '',

    init: function() //Khoi tao bang gia
    {
        if (location.host.search('localhost') != -1) {
            AV.read(AV.rootURL + 'packages/StockBoardLite/Symbol_Price_Online.js');
        }
        else {
            AV.read(AV.path + 'Symbol_Price_Online' + (AV.App.englishRef && (AV.Options.language == 'en' || AV.Options.language == '"en"') ? '_en' : '') + '.js');
        }
		
        if (this.floor == 'HA') {
            this.indexes = ['', '', '', '', ''];
        } else {
            this.indexes = [';;;;;', ';;;;;', ';;;;;', ';;;;;'];
        }
        if (location.href.indexOf('HOSEPT') != -1 || location.href.indexOf('HASEPT') != -1 || location.href.indexOf('HNXPT') != -1) {
            Stock.currentTab = 'put-through-block';
        }

        //that.getBasicInfo();//lay thong tin ma co phieu + gia tham chieu, tran, san	
        if (!this.marketInterval)
            this.marketInterval = setInterval(function() {
                if (Stock.isMarketClose()) //Neu la thi truong dong cua
                {
                    $.ajax({ type: "GET",
                        url: Stock.dataFileName(Stock.localhost ? '' + Stock.nextFile : 'market'), //Lay lai cac file market chu khong can load cac file khac nua
                        cache: false,
                        async: true,
                        success: function(data) {
                            //data = data.split('@');
                            //QuangNN - 5/4/2010 Neu la ngoai gio
                            if (location.href.indexOf('localhost') != -1) {
                                stock.serverTime = new Date().getTime();
                            }

                            if (data && data != Stock.marketStatus) {
                                Stock.marketStatus = data;
                                Stock.reinit(); //Neu co market thay doi thi load lai bang gia
                            }
                            else {
                                var date = new Date();
                                if (date.getHours() == 8 && (date.getMinutes() >= 29 || date.getMinutes() <= 30)) {
                                    Stock.reinit(); //Neu market khong doi nhung nam trong khoang 8h29 ->8h30 thi cung tu load lai
                                }
                            }
                        }
                    });
                }
            }, 10000); // Chu ky 10s/1 request market
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
	},
	
    ready: function() {
        Stock.adsHeight = $('#ads-block').height();
        if (!this.isRunReady) {
            this.isRunReady = true;
           
            $(document).click(function() {
                if (!Stock.isShowMenu) {
                    $('#board-menu').hide();
                    $('#sub-menu,.sub-menu').hide();
                    var module = $AV('StockBoardLite.Options');
                    if (module) module.close();
                }
                Stock.isShowMenu = false;
            });
            
            if (Stock.currentTab != 'put-through-block' && (AV.Options.tableType[Stock.floor] == 'infinite' || AV.Options.tableType[Stock.floor] == 'pageReplace')) {
                $('body').css('overflow', 'hidden');
            }
        }
        $('#choose-symbols-block').click(function(event) {
            event.stopPropagation();
            //event.preventDefault();
        });
        var root = document.compatMode == 'BackCompat' ? document.body : document.documentElement;
        var isHorizontalScrollbar = document.body.style.overflowX != 'hidden' && document.body.style.overflow != 'hidden' && (root.scrollWidth > root.clientWidth);

        var scrollHeight = (!$.browser.msie && isHorizontalScrollbar) ? 18 : 0;
        if (!$.browser.msie || parseInt($.browser.version) >= 7) {
            $('#ads-block').css({ top: (AV.clientHeight() - scrollHeight - Stock.adsHeight) + 'px', position: 'fixed' });
            $('#fix-header-block').css({ position: 'fixed' });
        }
        else {
            $('#ads-block').css({ top: (AV.clientHeight() - scrollHeight - Stock.adsHeight) + 'px' });
        }
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
            if (color != '') {
                if (AV.App.hightlightColor == 'revert') {
                    if (this.style.color != 'white') {
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
            async: true,
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
        //|| location.host.search('203.162.1.58')!=-1
        return (location.host.search('localhost') != -1) ? Stock.dataURL + this.floor + '/' + fn + '.txt' : '../../../' + this.floor + '.ashx?FileName=' + fn;
    },
    getMarketStatusHeader: function() {
        if (Stock.floor == 'DOUBLE') {
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
            case 'P':
            case 'A':
                return Lang.predict;
            case 'O':
                return Lang.matching;
            case 10:
            case '10':
                return Lang.matching;
        }
        return Lang.continuousMatching;
    },
    getInitDataSuccess: function(total) {
        var stock = Stock;
        stock.parseStockData(total, 1);

        if (!Stock.isMarketClose() && stock.timeData) {
            //			alert('hehe01'); //Load time lan dau o day, neu thi truong chua dong cua
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
        if (Stock.currentTab == 'put-through-block' || AV.App.showPTTinBoard) {
            if (Stock.transaction) {
                Stock.transaction.show();
                if (!AV.App.showPTTinBoard) Stock.ready();
            }
            else {
                AV.ExecQueue.add(function() {
                    Stock.transaction.show();
                    if (!AV.App.showPTTinBoard) Stock.ready();
                }, function() { return Stock.transaction; });
            }
        }
        if (Stock.currentTab != 'put-through-block') {
            if (!Stock.board || $('#boardData tr').length == 0 || AV.sizeof(Stock.allSymbols) == 0) {
                AV.ExecQueue.add(function() {
                    if (AV.Options.orderingColumn) {
                        AV.StockBoardLite.board.order(AV.Options.orderingColumn);
                    }
                    Stock.board.drawContent();
//                    Stock.drawFixHeader();
                    Stock.ready();
                }, function() { return Stock.board && AV.sizeof(Stock.allSymbols) > 0 && $('#boardData').length > 0; });
            }
            else {
                if (AV.Options.orderingColumn) {
                    AV.StockBoardLite.board.order(AV.Options.orderingColumn);
                }
                Stock.board.drawContent();
                Stock.drawFixHeader();
                Stock.ready();
            }
        }
        if (stock.statusWindow && stock.statusWindow.setMarketStatus) {
            setTimeout(function() {
                Stock.statusWindow.setTime(Stock.serverTime);
                Stock.statusWindow.setMarketStatus(Stock.getMarketStatus());
                if (Stock.floor != 'DOUBLE') {
                    if (Stock.marketStatus)
                        $('.marketStatus').html(Stock.getMarketStatusHeader());
                }
            }, 10);
        }
        else {
            AV.ExecQueue.add(function() {
                Stock.statusWindow = document.getElementById('statusWindow');
                if (Stock.statusWindow) {
                    Stock.statusWindow = Stock.statusWindow.contentWindow;
                    Stock.statusWindow.setTime(Stock.serverTime);
                    Stock.statusWindow.setMarketStatus(Stock.getMarketStatus());
                    if (Stock.floor != 'DOUBLE') {
                        if (Stock.marketStatus)
                            $('.marketStatus').html(Stock.getMarketStatusHeader());
                    }
                }
            }, function() { var win = document.getElementById('statusWindow'); return win && win.contentWindow && win.contentWindow.setTime; });
        }

        if (stock.statusWindowHeader && Stock.statusWindowHeader.setMarketStatusHeader) {
            setTimeout(function() {
                Stock.statusWindowHeader.setTimeHeader(Stock.serverTime);
                Stock.statusWindowHeader.setMarketStatusHeader(Stock.getMarketStatus());
                if (Stock.floor != 'DOUBLE') {
                    if (Stock.marketStatus)
                        $('.marketStatusHeader').html(Stock.getMarketStatusHeader());
                }
            }, 10);
        }
        else {
            AV.ExecQueue.add(function() {
                try {
                    Stock.statusWindowHeader = document.getElementById('statusWindowHeader');
                    if (Stock.statusWindowHeader != null && Stock.statusWindowHeader && Stock.statusWindowHeader != 'undefined') {
                        Stock.statusWindowHeader = Stock.statusWindowHeader.contentWindow;
                        Stock.statusWindowHeader.setTimeHeader(Stock.serverTime);

                        Stock.statusWindowHeader.setMarketStatusHeader(Stock.getMarketStatus());
                        if (Stock.floor != 'DOUBLE') {
                            if (Stock.marketStatus)
                                $('.marketStatusHeader').html(Stock.getMarketStatusHeader());
                        }
                    }
                }
                catch (Error)
                { }
            }, function() { var winHeader = document.getElementById('statusWindowHeader'); return winHeader && winHeader.contentWindow && winHeader.contentWindow.setTimeHeader; });
        }

        if (!Stock.board || $('#boardData tr').length == 0) {
            AV.ExecQueue.add(function() {
                if (AV.Options.showTopReport) {
                    AV.dialog('StockBoardLite.Top');
                }
                if (AV.Options.showFavouriteItems) {
                    AV.dialog('StockBoardLite.Favourite');
                }
                if (AV.Options.showTopPT) {
                    AV.dialog('StockBoardLite.Transaction');
                }
            }, function() {
                return $('#Dialog-StockBoardLite-Favourite').length;
            });
        }
        AV.App.isReady = true;
    },
    getInitData: function() {
        $.ajax({ type: "GET",
            url: Stock.dataFileName('0'),
            cache: false,
            async: true,
            success: Stock.getInitDataSuccess
        });
    },
    parseStockData: function(data, init) { //Ham nay dung de xu ly du lieu lay ve init=1,2
        /**
        * 0 time
        * 1 marketStatus
        * 2 indexes
        * 3 securities
        * 4 putThroughtBuy
        * 5 putThroughtTransaction
        * 6 putThroughtSale
        * 7 UPCOM Volumns
        * 7,8 lastFile
        */
        var stock = Stock;
        var board = Stock.board;
        if (!data || typeof (data) != 'string') {
            if (stock.currentTab != 'put-through-block') {
                //stock.securityUpdate('');
            }
            //return;
        }
        data = data.split('@');
        if (data[0]) {
            stock.timeData = data[0];

            var days = stock.timeData.split('/');
            stock.serverTime = Date.parse(days[1] + '/' + days[0] + '/' + days[2]);

            if (location.host.search('localhost') != -1) {
                stock.serverTime = new Date().getTime();
            }

            if (stock.statusWindow && stock.statusWindow.setTime) { //Cap nhat thoi gian o day
                Stock.statusWindow.setTime(Stock.serverTime);
            }
        }
        if (data[1]) {
            if (data[1] != stock.marketStatus) {
                stock.marketStatus = data[1];
                AV.ExecQueue.add(function() {
                    Stock.statusWindow = document.getElementById('statusWindow');
                    if (Stock.statusWindow) {
                        Stock.statusWindow = Stock.statusWindow.contentWindow;
                        Stock.statusWindow.setTime(Stock.serverTime);
                        Stock.statusWindow.setMarketStatus(Stock.getMarketStatus());
                    }
                }, function() { var win = document.getElementById('statusWindow'); return win && win.contentWindow && win.contentWindow.setTime; });

                if (!init) {
                    Stock.reinit();
                    return;
                }
            }
        }
        if (data[2]) {
            stock.indexRawData = data[2];
			//alert('from parseStock');
            if (stock.index) {
                setTimeout(Stock.index.parseData, 10);
            }
            else {
                AV.ExecQueue.add(function() { Stock.index.parseData(); }, function() { return Stock.index; });
            }
        }
        else if (init == 1) {
            stock.indexRawData = '||||';
            AV.ExecQueue.add(function() { Stock.index.parseData(); }, function() { return Stock.index; });

        }
        else {
            setTimeout(Stock.index.drawIndex, 20);
        }
        if (Stock.currentTab == 'put-through-block' || AV.App.showPTTinBoard) {
            stock.pttData = [data[4], data[5], data[6]];
            AV.ExecQueue.add(function() {
                if (init == 1) stock.transaction.update()
                else setTimeout(stock.transaction.update, 10);
            }, function() { return elem('ptt1'); });
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
            }
            //			alert(securities[0]);
            for (var i in securities) {
                var security = securities[i],
        pos = security.indexOf(';'),
        symbol = security.substr(0, pos),
        items = security.substr(pos),
        stockSecurity = stock.securities[symbol];
                if (!init) {
                    //if(symbol == 'ABT') alert(items);
                    if (stockSecurity && (!AV.Options.showSymbols[stock.floor] || AV.Options.showSymbols[stock.floor][symbol])) {

                        if (!stockSecurity.hightlight) {
                            stockSecurity.hightlight = [];
                            for (var i = 1; i <= 36; i++) {
                                stockSecurity.hightlight[i] = '';
                            }
                        }
                        if (stock.allSymbols[symbol]) {
                            var stockPos = stock.allSymbols[symbol][5];
                            {
                                stock.lastSecurities[symbol] = 3;
                            }

                            items = items.split(';');
                            for (var j = 0, length = items.length; j < length; j++) {
                                if (items[j]) {
                                    var values = items[j].split(':');
                                    if (values.length == 2) {
                                        stockSecurity.prices[values[0]] = values[1];
                                        stockSecurity.hightlight[values[0]] = ' high-light-ceil';
                                        if (values[0] == 8) {
                                            stockSecurity.hightlight[7] = ' high-light-ceil';
                                        }
                                    }
                                    stock.updateSecurityStatusWithCol(stockSecurity, values[0]);
                                }
                            }
                        }
                    }
                }
                else {
                    var oldPrices = stock.securities[symbol] ? stock.securities[symbol].prices : [], 
						prices = items.split(';');
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
                            stock.lastSecurities[symbol] = 3;
                        }
                    }
                    else {
                        if (!AV.Options.showSymbols[stock.floor] || AV.Options.showSymbols[stock.floor][symbol])
                            stock.orderedItems.push(symbol);
                    }
                    stock.updateSecurityStatus(stock.securities[symbol]);
                    if (board)
                        board.updateRow(stockSecurity);
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
        if (Stock.floor == 'UPCOM') {
            tradeStatuses[10] = '';
        }
        //		alert(AV.appName);exit;
        for (var i in prices) {
            if (Math.abs(prices[i]) < 0.01) {
                prices[i] = 0;
            }
            if (((i % 2) == 1 && i != 7 && i != 9 && i <= 19) || i == 18 || i == 28 || i == 30) //Cac o gia'
            {
                tradeStatuses[i] = getState(prices[i], stockInfo[1], stockInfo[2], stockInfo[3], i);
                if (prices[i] == 0 && prices[parseInt(i) + 1] > 0) {
                    tradeStatuses[i] = 'ss-basic';
                }

                if (i < 17 || AV.Options.volColor) {
                    tradeStatuses[parseInt(i) + 1] = tradeStatuses[i];
                }
            }
            else if (i == 2 || i == 4 || i == 6 || i == 12 || i == 14 || i == 16) //Cac o khoi luong
            {
                tradeStatuses[i] = getState(prices[i - 1], [1], stockInfo[2], stockInfo[3], i);
            }
        }
    },
	getState: function(price, ceil, floor, basic, index) {

        if (price == 'ATC' || price == 'ATO' || parseInt(price) == 0) {
            if (AV.App.ATOColor)
                return AV.App.ATOcolor;
            else
                if (index <= 7) return 'ss-ceil';
            else return 'ss-floor';
        }
        else
            if (Math.abs(price - basic) < 0.01) {
            return 'ss-basic';
        } else {
            if (Math.abs(price - ceil) < 0.01) {
                return 'ss-ceil';
            }
            if (Math.abs(price - floor) < 0.01) {
                return 'ss-floor';
            }
            if (price - basic > 0) {
                return 'ss-up';
            } else {
                return 'ss-down';
            }
        }
    },
	weightFormat: function(number) {
        var s = 1;
        if (AV.App.Unit[Stock.floor] && parseInt(AV.App.Unit[Stock.floor]) > 1) { s = parseInt(AV.App.Unit[Stock.floor]); number = number / s; }
        if (Stock.floor == 'UPCOM' || AV.App.euroStyleVolumn == '0') {
            return AV.numberFormat(number);
        }

        var value = AV.numberFormat(Math.round(number * 10)) + "";
        if (value)
            return value.substr(0, value.length - 1);
        else
            return value;
    },
    SBSweightFormat: function(number) {
        //        var s = 1;
        //        if (AV.App.Unit[Stock.floor] && parseInt(AV.App.Unit[Stock.floor]) > 1) {
        //            s = parseInt(AV.App.Unit[Stock.floor]);
        //            number = number / s;
        //        }
        number = number / 100;
        var value = parseFloat(number) > 1000 ? AV.numberFormat(parseInt(number)).toString() : AV.numberFormat(number);
        //        if (value) {
        //            value = value.length > 6 ? value.substr(0, 6) : value.substr(0, value.length - 1);
        //        }

        return value;
        //return AV.numberFormat(value);
    },
    updateSecurityStatusWithCol: function(security, col) {
        if (!security.tradeStatuses) security.tradeStatuses = [];
        var stock = Stock, prices = security.prices, stockInfo = Stock.allSymbols[security.symbol], tradeStatuses = security.tradeStatuses;
        if (!stockInfo) return;

        if (Math.abs(prices[i]) < 0.01) {
            prices[i] = 0;
        }
        var i = parseInt(col);
        if (((i % 2) == 1 && i != 7 && i != 9 && i != 10 && i <= 19) || i == 18 || i == 28 || i == 30) {
            tradeStatuses[i] = getState(prices[i], stockInfo[1], stockInfo[2], stockInfo[3], i);
            if (prices[i] == 0 && prices[parseInt(i) + 1] > 0) {
                tradeStatuses[i] = 'ss-basic';
            }

            if (i < 17 || AV.Options.volColor || i == 28 || i == 30) {
                tradeStatuses[parseInt(i) + 1] = tradeStatuses[i];
            }
        }
        else if (i == 2 || i == 4 || i == 6 || i == 12 || i == 14 || i == 16) {
            tradeStatuses[i] = getState(prices[i - 1], stockInfo[1], stockInfo[2], stockInfo[3], i);
        }
        else
            if (col == 8 || col == 7) {
            security.status = (prices[8] == 0) ? 'ss-basic' : getState(prices[8], stockInfo[1], stockInfo[2], stockInfo[3], 8);
            //Load thay doi
            /*if(security.symbol=='ABT')
            alert(security.status+'1');*/
            //security.arrowIcon = (prices[7]>0) ? stock.specialSymbols[0] : ((prices[7]<0) ?stock.specialSymbols[1]:stock.specialSymbols[2]);
            //QuangNN 25/03/2010
            security.arrowIcon = (prices[7] > 0 && prices[8] == stockInfo[1]) ? stock.specialSymbols[4] : (prices[7] < 0 && prices[8] == stockInfo[2]) ? stock.specialSymbols[5] : (prices[7] < 0) ? stock.specialSymbols[1] : (prices[7] > 0) ? stock.specialSymbols[0] : stock.specialSymbols[2];
            if (AV.App.highlightwithStatus) {
                var a = AV.App.highlightwithStatus.split(',');
                for (var k in a)
                    tradeStatuses[k] = security.status;
            }
            else
                tradeStatuses[0] = tradeStatuses[7] = tradeStatuses[8] = tradeStatuses[9] = tradeStatuses[10] = tradeStatuses[20] = security.status;
            /*			if(security.symbol=='ABT')
            alert(tradeStatuses[0]+'-hehe');
            */
        }
        else
            if (AV.App.changeColor == 'priceOnly') {
            //security.arrowIcon = (security.status == 'ss-ceil')?'CE':((security.status == 'ss-floor')?'FL':security.arrowIcon);
            //QuangNN - 24/03/2010
            security.arrowIcon = (security.status == 'ss-ceil') ? '' : ((security.status == 'ss-floor') ? '' : security.arrowIcon);
        }
    },
    redraw: function() {
        var that = this;
        this.isDrawSelectSymbolForm = false;

        if (AV.Options.showTopReport) {
            AV.dialog('StockBoardLite.Top');
        }
        if (AV.Options.showFavouriteItems) {
            AV.dialog('StockBoardLite.Favourite');
        }
        if (AV.Options.showTopPT) {
            AV.dialog('StockBoardLite.Transaction');
        }
        //Stock.updateElementsPosition();
        /*setTimeout(function(){Stock.resize(); }, 100);*/
        Stock.allowedPos = $("#stockBoard").height() - $("#board-block").height();
        //Stock.updateElementsPosition();
    },
    requestStock: function() {

        var stock = Stock, marketStatus = stock.marketStatus;

        if (marketStatus == 'K' || marketStatus == 'Z' || marketStatus == '13' || marketStatus == '15') {
            return;
        }
        if (!stock.nextFile || stock.isProccessing) {
            return;
        }
        stock.isProccessing = true;
        var url = stock.dataFileName(stock.nextFile);
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
        else if ($.browser.msie) {
            stock.xmlHttpReq.abort();
        }
        stock.xmlHttpReq.onreadystatechange = updateStock;
        stock.xmlHttpReq.open('GET', url + ((url.indexOf('?') != -1) ? '&' : '?') + '_t=' + new Date().getTime(), true);
        //stock.xmlHttpReq.setRequestHeader('Content-Type', 'text/plain');
        if (!$.browser.msie)
            stock.xmlHttpReq.overrideMimeType('text/plain');

        setTimeout(function() {
            Stock.xmlHttpReq.send(null);
            Stock.xmlHttpReq.onreadystatechange = updateStock;
        }, 10);
    },
    getMarketStatus: function(status) {
        var that = this;
        if (that.floor == 'DOUBLE' && typeof (status) == 'undefined') {
            var statuses = that.marketStatus.split(';');
            if (statuses.length == 3) {
                if (!Stock.oldStatuses) {
                    Stock.oldStatuses = [];
                }
                if (Stock.oldStatuses[0] != statuses[0]) {
                    $('#index-0-status').html(this.getMarketStatus(statuses[0]));
                }
                if (Stock.oldStatuses[1] != statuses[1]) {
                    $('#index-1-status').html(this.getMarketStatus(statuses[1]));
                }
                if (Stock.oldStatuses[2] != statuses[2]) {
                    $('#index-2-status').html(this.getMarketStatus(statuses[2]));
                }
                Stock.oldStatuses = statuses;
                return 'HO: ' + this.getMarketStatus(statuses[0]) + ' - HA: ' + this.getMarketStatus(statuses[1]) + ' - UPCOM: ' + this.getMarketStatus(statuses[2]);
            }
            return '';
        }
        switch (status ? status : that.marketStatus) {
            case 'P':
                return Lang.getOpenMarket;
                break;
            case 'O':
                return Lang.continueMarket;
                break;
            case 'A':
                return Lang.getCloseMarket;
                break;
            case 'C':
                return Lang.pttMarket;
                break;
            case 5:
            case '5':
                return Lang.MARKET_STATUS_OPEN;
                break;
            case 15:
            case '15':
                return Lang.closeDay;
                break;
            case 10:
            case '10':
                return Lang.BreakTime;
            default:
                return Lang.MARKET_STATUS_CLOSE;
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
    open: function(symbol) {
        window.open(Stock.href + symbol);
    },
    pressedKeyCode: '',  /*duonghte : lưu mã ASCII các phím đã nhấn trg 1 khoảng thời gian*/

    scrollInterval: '', /*duonghte : interval cua table kiểu cuon*/
    allowedPos: 0,
    blockBoardTopPosition: 0,
    fixHeaderBlockDisplay: 'none',
    visibleRow: 0,
    insertRowToStockTBody: function(symbol, tbody) {
        var ok = false;
        tbody.find('tr').each(function() {
            if (Stock.board.columnOrder(this.id.substr(2), symbol) >= 0) {
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
        if ($.browser.msie) {
            $('#selectedBoardData>tr').removeClass('lastRow');
        }
        AV.Options.topSymbols[symbol] = 1;
        AV.Options.save('topSymbols');
        this.insertRowToStockTBody(symbol, $('#selectedBoardData'));
        $('#selectedBoardData').show();
        if ($.browser.msie) {

            $('#selectedBoardData>tr:last').addClass('lastRow');

        }
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
        /*if(!$.browser.msie && AV.Options.tableType[Stock.floor] != 'normal')
        {
        var obj = elem('selectedBoardData');
        $("#boardData").height((AV.Options.lineCount-obj.childNodes.length-1)*AV.Options.lineHeight);
        }*/
    },
    goReturnSymbols: function(symbol) {
        if (typeof (AV.Options.topSymbols[symbol]) != 'undefined') {
            if ($.browser.msie) {
                $('#selectedBoardData>tr:last').removeClass('lastRow');
            }
            delete AV.Options.topSymbols[symbol];
            AV.Options.save('topSymbols');
            this.insertRowToStockTBody(symbol, $('#boardData'));
            if ($('#selectedBoardData>tr').length == 0) {
                $('#selectedBoardData').hide();
            }
            else
                if ($.browser.msie) {
                $('#selectedBoardData>tr:last').addClass('lastRow');
            }
            if (typeof (ScrollTableObj) != 'undefined') {
                ScrollTableObj.firstRow = ScrollTableObj.boardData.firstChild;
                ScrollTableObj.hiddenFirstRow = ScrollTableObj.hiddenBoardData.firstChild;
            }
            /*if(!$.browser.msie && AV.Options.tableType[Stock.floor] != 'normal')
            {
            var obj = elem('selectedBoardData');
            $("#boardData").height((AV.Options.lineCount-obj.childNodes.length+1)*AV.Options.lineHeight);	
            }*/

        }
    },
    deleteKeySymbols: function() { /*duonghte */
        Stock.pressedKeyCode = "";
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

    getExtraInfoBgColor: function(symbol) {
        if (!Stock.allSymbols[symbol] || !Stock.allSymbols[symbol][7]) return '';
        var items = (Stock.allSymbols[symbol][7] + '');
        if (items.indexOf('A') != -1) return 'blue';
        if (items.indexOf('D') != -1) return '#00E138';
        return '#90C';
    },
    changeCategory: function(id) {
        AV.Options.save('currentCategory_' + Stock.floor, id);
        location.reload();
    }
};
getState = Stock.getState;
getStateColor = Stock.getStateColor;
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
            //					alert($.toJSON(stock.lastSecurities));
            for (var i in lastSecurities) {
                //stock.processCount++;
                if (lastSecurities[i] > 0) //QuangNN 31/3/2010 - Cac thay doi moi update lai row nay
                {
                    if (!AV.Options.showSymbols[Stock.floor] || (AV.Options.showSymbols[stock.floor][i]) && stock.securities[i]) {
                        lastSecurities[i] = lastSecurities[i] - 1;
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
function redirect() {
    if (location.href.indexOf("/VDSC/") != -1)
        location.href = location.href.replace("/VDSC/", "/VDSC_2/");
    else if (location.href.indexOf("/VDSC_2/") != -1)
        location.href = location.href.replace("/VDSC_2/", "/VDSC/");
}