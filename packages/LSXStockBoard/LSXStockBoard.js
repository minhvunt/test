Stock = AV.LSXStockBoard = {
    version: '1.0 RC1',
    floor: 'LSX', //lưu tên sàn hiện tại, mặc định lúc đầu là vào sàn HOSE
    lastSecurities: {}, //Danh sach cac ma thay doi
    localhost: (location.host.search('localhost') != -1), //|| location.host.search('203.162.1.58')!=-1
    isAuto: (location.host.search('listID') != -1),
    listData: [],
    acceptKeypress: true, //Tim kiem theo go~ phim
    volumns: {}, //Khoi luong cua UPCOM
    marketStatus: '', // lưu trạng thái thị trường,
    serverTime: (new Date()).getTime(), // lưu giờ hệ thống
    href: 'http://www.sbsc.com.vn/portal/viewInvCorporate.do?symbol=', //Link vao tung ma chung khoan
    accountHref: 'http://localhost:83/',
    homeUrl: 'www.sbsc.com.vn', //Link trang chu
    dataURL: 'data/', //Thu muc file
    indexes: [[], [], [], [], []], //Mang luu du lieu Index
    oldIndexes: [[], [], [], [], []], //Mang luu du lieu Index cu
    securities: false, //Danh sach ma chung khoan,
    symbols:false,
    orderedItems: false, //Danh sach order
    nextFile: '', //File du lieu tiep theo
    tryCount: 0,
    tryMax: 10,
    time: new Date(),
    refreshRate: $.browser.msie ? 1000 : 1000, //tan so refresh data
    isProccessing: false, //Bien the hien co dang xu ly du lieu khong
    processCount: 0,
    currentTab: 'HO', //Tab hien tai
    layout: 'LXS', //Layout mau
    specialSymbols: ['▲', '▼', '■', '     ', '▲', '▼'],   //['mui ten len', 'mui ten xuong','dung yen']■█
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
        /*
		if (location.host.search('localhost') != -1) {
            AV.read(AV.rootURL + 'packages/StockBoard/Symbol_Price_Online.js');
        }
        else {
            AV.read(AV.path + 'Symbol_Price_Online' + (AV.App.englishRef && (AV.Options.language == 'en' || AV.Options.language == '"en"') ? '_en' : '') + '.js');
        }
		*/
        if (location.href.search('listID') != -1) {
            /*
            QuangNN : (20/4/2010)
            Neu la chay theo dinh nghia san
            Lay thong tin ve task nay, 
            lay ra toan bo cac config, va thoi gian, 
            sau do gan vao cookie de san sang
            */
            var listID = AV.getParameter(location.href, 'listID');
            $.ajax({
                type: "GET",
                url: '../../../Forms/Configuration.ashx?a=GetSymbol&b=' + listID,
                cache: false,
                success: function(data) {
                    var temp = eval('(' + data + ')');
                    AV.Options.showSymbols = temp.showSymbols;
                }
            });
        }

        if (location.href.indexOf('taskID') != -1) {
            Stock.selectList(AV.getParameter(location.href, 'taskID'));
        }

        if (AV.App.useCategory) { //Danh muc (goi la cac config)

            AV.read(Stock.localhost ? 'data/categories.txt?' : ('../../../' + Stock.floor + '.ashx?FileName=FieldValues' + ((AV.Options.language == 'en') ? '_En' : '') + '&t=' + (new Date().getTime())), { async: false }, function(code) {

                if (code) {
                    var items = code.split('|');
                    for (var i = 0; i < items.length; i++) {
                        items[i] = items[i].split(';');
                    }
                    Stock.categories = items;

                    var category = AV.Options['currentCategory_' + Stock.floor];
                    if (category && items[parseInt(category) - 1]) {
                        AV.Options.showSymbols[Stock.floor] = {};
                        var stocks = items[parseInt(category) - 1], showSymbols = AV.Options.showSymbols[Stock.floor];

                        for (var i = 1; i < stocks.length; i++) {
                            showSymbols[stocks[i]] = 1;
                        }	
						
						//Them cac ma nam trong topSymbols vao trong bang
						var topSymbols = AV.Options.topSymbols;
						if(topSymbols && showSymbols){
							$.each(topSymbols, function(key, value) { 
							  if(value==1){
								  showSymbols[key] = 1;
							  }
							});
						}					
                    }
					
					
                }
            });
        }
		
        if (this.floor == 'HA') {
            this.indexes = ['', '', '', '', ''];
        } else {
            this.indexes = [';;;;;', ';;;;;', ';;;;;', ';;;;;'];
        }
        if (location.href.indexOf('HOSEPT') != -1 || location.href.indexOf('HASEPT') != -1 || location.href.indexOf('HNXPT') != -1) {
            Stock.currentTab = 'put-through-block';
			AV.Options.showTopPT = true;
			//$('body').css('overflow', 'hidden');
        }
        if (typeof (AV.App.map.HA) == 'string') {
            AV.App.map.HA = AV.App.map.HA.split(',');
        }
        if (typeof (AV.App.map.HO) == 'string') {
            AV.App.map.HO = AV.App.map.HO.split(',');
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
	
	changeFontStyle:function(style) {
		
		if (style == 'boldAll') {
			$('.stockBoard, #stockBoard').css('font-weight','normal');
		}else if (style=='normal') {
			$('.stockBoard').css('font-weight','bold');
			this.addRule('.mainColumn span','font-weight:bold')
		}else {
			$('.stockBoard').css('font-weight','normal');
			this.oldFontCssIndex = this.addRule('.mainColumn','font-weight:bold');
			this.addRule('.mainColumn span','font-weight:bold')
		}
		$('input[name=fontStyle][value='+style+']').attr('checked','checked');
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
	
    selectList: function(id) {
        if (id) {

            var that = this;
            AV.read((Stock.localhost ? Stock.accountHref : '') + '/Forms/Configuration.ashx?a=GetSchedule&b=' + id + '&t=' + (new Date().getTime()), { dataType: 'text' }, function(response) {
                if (response) {
                    that.currentSchedule = id;
                    //Load toan bo thong tin cua Config nay ra
                    var schedules = response.split('@');
                    if (schedules.length > 0) {
                        var currentProfile = schedules[0].split(',');
                        that.currentListId = currentProfile[0];
                        //that.nextTime = currentProfile[1];
                        that.nextProfile = '';
                        that.nextPage = '';
                        if (schedules.length > 1) {


                            for (var i = 1; i < schedules.length; i++) {
                                var profile = schedules[i].split(',');

                                var days = currentProfile[1].split('/');
                                that.nextTime = Date.parse(days[1] + '/' + days[0] + '/' + days[2]);

                                that.nextProfile = profile[0];
                                that.nextPage = profile[3];
                                break;
                            }
                        }

                        AV.Options.currentSchedule = that.currentListId;
                        AV.Options.nextProfile = that.nextProfile;
                        AV.Options.nextPage = that.nextPage;
                        AV.Options.nextTime = that.nextTime;
                        AV.Options.save();
                    }

                    AV.read((Stock.localhost ? Stock.accountHref : '') + '/Forms/Configuration.ashx?a=GetSymbol&b=' + that.currentListId + '&t=' + (new Date().getTime()), { dataType: 'json' }, function(response1) {
                        if (response1) {
                            Stock.orderedItems = [];
                            AV.Options.save('listID', that.currentListId);

                            var stocks = AV.Options.showSymbols[Stock.floor];

                            for (var i = 0; i < stocks.length; i++) {
                                stocks[stocks[i]] = 1;
                                Stock.orderedItems.push(stocks[i]);
                            }						

                            var obj = response1;
                            AV.Options.showSymbols = obj.showSymbols;

                            AV.Options.showFavouriteItems = obj.showFavouriteItems;
                            AV.Options.showTopReport = obj.showTopReport;
                            AV.Options.showTopPT = obj.showTopPT;
                            AV.Options.favouriteItems = obj.favouriteItems;
                            AV.Options.orderDir = obj.orderDir;
                            AV.Options.orderingColumn = obj.orderingColumn;
                            AV.Options.oldCssIndexes = obj.oldCssIndexes;
                            AV.Options.topSymbols = obj.topSymbols;
                            AV.Options.language = obj.language;
                            AV.Options.boardStyle = obj.boardStyle;
                            AV.Options.volColor = obj.volColor;
                            AV.Options.fontStyle = obj.fontStyle;
                            AV.Options.hideColumns = obj.hideColumns;

                            var objHide = AV.Options.hideColumns[Stock.floor].toString().split(',');

                            AV.Options.scrollDelay = obj.scrollDelay;
                            AV.Options.waitingTime = obj.waitingTime;
                            AV.Options.lineHeight = obj.lineHeight;
                            AV.Options.lineCount = obj.lineCount;
                            AV.Options.tableType = obj.tableType;
                            AV.Options.screenWidth = obj.screenWidth;

                            AV.Options.save();
                        }
                    });
                }
            });
        }
    },
    ready: function() {
        Stock.adsHeight = $('#ads-block').height();
        if (!this.isRunReady) {
            this.isRunReady = true;
            $(document).keypress(function(e) {
                if (Stock.acceptKeypress) {
                    if (e.which == 32 || (65 <= e.which && e.which <= 65 + 25) || (97 <= e.which && e.which <= 97 + 25)) {
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
            
            AV.resize(function(){
            var root= document.compatMode=='BackCompat'? document.body : document.documentElement;
            var isHorizontalScrollbar = document.body.style.overflowY != 'hidden' && document.body.style.overflow != 'hidden' && (root.scrollWidth>root.clientWidth);

				var scrollHeight = (!$.browser.msie && isHorizontalScrollbar)?18:0;
            if($.browser.ie6)
            {
            $('#ads-block').css('top',(parseInt($(document).scrollTop())-scrollHeight-Stock.adsHeight+AV.clientHeight())+'px');
            }
            else
            {
            $('#ads-block').css('top',(AV.clientHeight()-scrollHeight-Stock.adsHeight)+'px');
            }
            //Stock.resize();
            });
            
            $(window).scroll(Stock.showFixHeader);
            if (Stock.currentTab != 'put-through-block' && (AV.Options.tableType[Stock.floor] == 'infinite' || AV.Options.tableType[Stock.floor] == 'pageReplace')) {
                $('body').css('overflow', 'hidden');
            }
            setInterval(function() {
                if (AV.Options.showFavouriteItems) {
                    var favourite = $AV('StockBoard.Favourite');
                    if (favourite) $AV('StockBoard.Favourite').update();
                }

                if (AV.Options.showTopReport) {
                    var favourite = $AV('StockBoard.Top');
                    if (favourite) {
                        $AV('StockBoard.Top').update();
                    }
                }

                if (AV.Options.showTopPT) {
                    var topPT = $AV('StockBoard.Transaction');
                    if (topPT) {
                        $AV('StockBoard.Transaction').draw();
                    }
                }
            }, 10000);
            //QuangNN - 29/03/2010 - Cai nay dung de lay index cua tat ca cac san trong 1 bang gia
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
		
		var s = '';
		if(Stock.floor=='DOUBLE')
		{			
			$.each(AV.Options.showSymbols[Stock.floor], function(key, value) { 
			  if(value==1){
				  s+=key+',';
			  }
			});
		}
		
        $.ajax({ type: "GET",
            url: Stock.dataFileName('0' + (Stock.localhost ? ('-' + Stock.nextFile) : (Stock.floor=='DOUBLE') ? '&s='+s : '')),
            cache: false,
            async: true,
            success: function(data) {
				//alert('hehe');
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
            case '99':
                return Lang.marketClose;
			case '':
			case '20':
			case '30':
			case '50':
                return Lang.predict;
            case '40':
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
                        AV.LSXStockBoard.board.order(AV.Options.orderingColumn);
                    }
					else
						AV.LSXStockBoard.board.order(0);
                    Stock.board.drawContent();
                    Stock.drawFixHeader();
                    Stock.ready();
                }, function() { return Stock.board && AV.sizeof(Stock.allSymbols) > 0 && $('#boardData').length > 0; });
            }
            else {
                if (AV.Options.orderingColumn) {
                    AV.LSXStockBoard.board.order(AV.Options.orderingColumn);
                }
				else
					AV.LSXStockBoard.board.order(0);
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
                    AV.dialog('StockBoard.Top');
                }
                if (AV.Options.showFavouriteItems) {
                    AV.dialog('StockBoard.Favourite');
                }
                if (AV.Options.showTopPT) {
                    AV.dialog('StockBoard.Transaction');
                }
            }, function() {
                return $('#Dialog-StockBoard-Favourite').length;
            });
        }
        AV.App.isReady = true;
    },
    getInitData: function() {
		var s = '';
		if(Stock.floor=='DOUBLE')
		{			
			$.each(AV.Options.showSymbols[Stock.floor], function(key, value) { 
			  if(value==1){
				  s+=key+',';
			  }
			});
		}
        $.ajax({ type: "GET",
            url: Stock.dataFileName('0' + (Stock.localhost ? ('-' + Stock.nextFile) : (Stock.floor=='DOUBLE') ? '&s='+s : '')),
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
            /*
            QuangNN : 20/4/2010
            Kiem tra neu gio server nam trong khoang tuong duong config nao thi apply config do
            */
            //alert(stock.serverTime);
            if (location.host.search('localhost') != -1) {
                stock.serverTime = new Date().getTime();
            }
            //            alert(stock.serverTime);
            if (stock.serverTime > this.nextTime && this.nextTime != '') {
                if (this.currentSchedule != null && this.currentSchedule != '') {
                    this.selectList(this.currentSchedule);
                    location.href = this.nextPage;
                }
            }
			
            if (stock.statusWindow && stock.statusWindow.setTime) { //Cap nhat thoi gian o day
                //				alert('hehe02');
                Stock.statusWindow.setTime(Stock.serverTime);
/*                if (AV.appName = 'SBSC')
                    Stock.statusWindow.setTimeClassName();
*/            }

            if (stock.statusWindowHeader && Stock.statusWindowHeader.setTimeHeader) { //Cap nhat thoi gian o day
                Stock.statusWindowHeader.setTimeHeader(Stock.serverTime);

                /*if (AV.appName = 'SBSC') {
                    Stock.statusWindowHeader.setTimeClassNameHeader();
                }*/
            }
        }

        if (data.length) stock.nextFile = data[data.length - 1];
        if (data[1]) {
            if (data[1] != stock.marketStatus) {
                stock.marketStatus = data[1];
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

                AV.ExecQueue.add(function() {
                    try {
                        Stock.statusWindowHeader = document.getElementById('statusWindowHeader');
                        if (Stock.statusWindowHeader && Stock.statusWindowHeader != 'undefined') {
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

                if (!init) {
                    Stock.reinit();
                    return;
                }
            }
        }
		if(AV.App.viewAllIndex)
		{			
			if (stock.index) {
                setTimeout(Stock.index.parseData, 10);
            }
            else {
                AV.ExecQueue.add(function() { Stock.index.parseData(); }, function() { return Stock.index; });
            }
		}
		else if (data[2]) {
            stock.indexRawData = data[2];
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
                            for (var i = 1; i <= 39; i++) {
                                stockSecurity.hightlight[i] = '';
                            }
                        }
                        if (stock.allSymbols[symbol]) {
                            var stockPos = stock.allSymbols[symbol][5];
                            //if(stock.visibleRow <= stockPos && stock.visibleRow >stockPos - ((AV.clientHeight()/25+5)))
                            {
                                stock.lastSecurities[symbol] = 3;
                            }

                            items = items.split(';');
                            for (var j = 0, length = items.length; j < length; j++) {
                                if (items[j]) {
                                    var values = items[j].split(':');
                                    if (values.length == 2) {
                                        if (AV.appName == 'Rubse' && location.href.indexOf('?local') != -1) {
                                            if (!stockSecurity.oldPrices) stockSecurity.oldPrices = {};
                                            stockSecurity.oldPrices[values[0]] = stockSecurity.prices[values[0]];
                                        }
                                        //if(values[0] == 18)alert(map[values[0]]);
                                        stockSecurity.prices[values[0]] = values[1];

                                        //if(values[1] == 'ATC') alert(symbol+values[0]);
                                        stockSecurity.hightlight[values[0]] = ' high-light-ceil';
                                        if (values[0] == 8) {
                                            stockSecurity.hightlight[7] = ' high-light-ceil';
                                            //stockSecurity.hightlight[20] = stockSecurity.hightlight[21] =

                                        }
                                    }
                                    stock.updateSecurityStatusWithCol(stockSecurity, values[0]);
                                    //board.updateRowWithCol(stockSecurity,values[0]);
                                }
                            }
                            //stock.updateSecurityStatus(stockSecurity);
                            //board.updateRow(stockSecurity);
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
        security.status = (prices[12] == 0 && prices[11] == 0) ? 'ss-basic' : getState(prices[12], stockInfo[1], stockInfo[2], stockInfo[3], 12);
        //QuangNN 25/03/2010
        security.arrowIcon = (prices[11] > 0 && prices[12] == stockInfo[1]) ? stock.specialSymbols[4] : (prices[11] < 0 && prices[12] == stockInfo[2]) ? stock.specialSymbols[5] : (prices[11] < 0) ? stock.specialSymbols[1] : (prices[11] > 0) ? stock.specialSymbols[0] : stock.specialSymbols[2];
        if (AV.App.changeColor == 'priceOnly') {
            //security.arrowIcon = (security.status == 'ss-ceil')?'CE':((security.status == 'ss-floor')?'FL':security.arrowIcon);
            //QuangNN - 24/03/2010
            security.arrowIcon = (security.status == 'ss-ceil') ? '' : ((security.status == 'ss-floor') ? '' : security.arrowIcon);
        }        
        for (var i in prices) {
            if (Math.abs(prices[i]) < 0.001) {
                prices[i] = 0;
            }
            else if (i==1 || i==3 || i==5 || i==7 || i==9 || i==15 || i==17 || i==19 || i==21 || i==23 || i==25 || i==26 || i==32 || i==34) //Cac o gia'
            {
                tradeStatuses[i] = getState(prices[i], stockInfo[1], stockInfo[2], stockInfo[3], i);
                if (prices[i] == 0) {
                    tradeStatuses[i] = 'ss-basic';
                }
                tradeStatuses[parseInt(i) + 1] = tradeStatuses[i]; // Cho cac o KL cung tu thay doi theo luon
            }
            else if (i == 2 || i == 4 || i == 6 || i == 8 || i == 10 || i == 16 || i==18 || i==20 || i==22 || i==24 || i==33 || i==35) //Cac o khoi luong
            {
                tradeStatuses[i] = getState(prices[i - 1], stockInfo[1], stockInfo[2], stockInfo[3], i);
            }
			else if(i==0 || i==11 || i==12 || i==13 || i==14 || i==27 || i==28)
			{
				tradeStatuses[i] = 	getState(prices[12], stockInfo[1], stockInfo[2], stockInfo[3], i);
				if(i==12){
					tradeStatuses[0] = tradeStatuses[11] = tradeStatuses[13] = tradeStatuses[14] = tradeStatuses[27] = tradeStatuses[28] = tradeStatuses[i];
				}
			}
        }
    },
    updateSecurityStatusWithCol: function(security, col) {
        if (!security.tradeStatuses) security.tradeStatuses = [];
        var stock = Stock, prices = security.prices, stockInfo = Stock.allSymbols[security.symbol], tradeStatuses = security.tradeStatuses;
        if (!stockInfo) return;
	
		var i = col;
        if (Math.abs(prices[i]) < 0.001) {
			prices[i] = 0;
		}
		else if (((i % 2) == 1 && i != 11 && i != 13 && i <= 24) || i == 25 || i == 26 || i==32 || i==34) //Cac o gia'
		{
			tradeStatuses[i] = getState(prices[i], stockInfo[1], stockInfo[2], stockInfo[3], i);
			if (prices[i] == 0 && prices[parseInt(i) + 1] > 0) {
				tradeStatuses[i] = 'ss-basic';
			}
			tradeStatuses[parseInt(i) + 1] = tradeStatuses[i];
		}
		else if (i == 2 || i == 4 || i == 6 || i == 8 || i == 10 || i == 16 || i==18 || i==20 || i==22 || i==24 || i==33 || i==35) //Cac o khoi luong
		{
			tradeStatuses[i] = getState(prices[i - 1], stockInfo[1], stockInfo[2], stockInfo[3], i);
		}
		else if(i==0 || i==11 || i==12 || i==13 || i==14 || i==27 || i==28)
		{
			tradeStatuses[i] = 	getState(prices[12], stockInfo[1], stockInfo[2], stockInfo[3], i);
			if(i==12){
				tradeStatuses[0] = tradeStatuses[11] = tradeStatuses[13] = tradeStatuses[14] = tradeStatuses[27] = tradeStatuses[28] = tradeStatuses[i];
			}
		}
    },
    redraw: function() {
        var that = this;
        this.isDrawSelectSymbolForm = false;

        if (AV.Options.showTopReport) {
            AV.dialog('StockBoard.Top');
        }
        if (AV.Options.showFavouriteItems) {
            AV.dialog('StockBoard.Favourite');
        }
        if (AV.Options.showTopPT) {
            AV.dialog('StockBoard.Transaction');
        }
        //Stock.updateElementsPosition();
        /*setTimeout(function(){Stock.resize(); }, 100);*/
        Stock.allowedPos = $("#stockBoard").height() - $("#board-block").height();
        //Stock.updateElementsPosition();
    },
    requestStock: function() {

        var stock = Stock, marketStatus = stock.marketStatus;

        if (marketStatus == 'K' || marketStatus == 'Z' || marketStatus == '13' || marketStatus == '15' || marketStatus == '99') {
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
        if ((that.floor == 'DOUBLE') && typeof (status) == 'undefined') {
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
            case '00':
                return Lang.M00;
                break;
            case '10':
                return Lang.M10;
                break;
            case '11':
                return Lang.M11;
                break;
            case '20':
                return Lang.M20;
                break;
            case '21':
                return Lang.M21;
            case '30':
                return Lang.M30;
                break;
            case '40':
                return Lang.M40;
				break;
			case '50':
				return Lang.M50;
				break;
			case '60':
				return Lang.M60;
				break;
			case '65':
				return Lang.M65;
				break;
			case '70':
				return Lang.M70;
				break;
			case '80':
				return Lang.M80;
				break;				
			case '90':
				return Lang.M90;
				break;
			case '99':
				return Lang.M99;
				break;
            default:
                return Lang.MARKET_STATUS_CLOSE;
        }
    },
    isMarketClose: function() {
        var marketStatus = this.marketStatus;
        return (marketStatus == 'K' || marketStatus == 'Z' || marketStatus == '13' || marketStatus == '15' || marketStatus=='99');
    },
    getBasicInfo: function() {
		var s = '';
		if(Stock.floor=='DOUBLE')
		{			
			$.each(AV.Options.showSymbols[Stock.floor], function(key, value) { 
			  if(value==1){
				  s+=key+',';
			  }
			});
		}
        $.ajax({ type: "GET",
            url: Stock.dataFileName('ref' + (AV.App.englishRef && (AV.Options.language == 'en' || AV.Options.language == '"en"') ? '_en' : (Stock.floor=='DOUBLE') ? '&s='+s : '')),
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
    getOtherState: function(price, ceil, floor, basic, index) {
        if (price == 'ATC' || price == 'ATO' || parseInt(price) == 0) {
            if (AV.App.ATOcolor)
                return AV.App.ATOcolor;
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
		if (price > 0) {
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
        window.open(Stock.href + symbol);
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
        if ($.browser.ie6) {
            if (!Stock.adsHeight) Stock.adsHeight = $('#ads-block').height();
            var root = document.compatMode == 'BackCompat' ? document.body : document.documentElement;
            var isHorizontalScrollbar = document.body.style.overflowX != 'hidden' && document.body.style.overflow != 'hidden' && (root.scrollWidth > root.clientWidth);

            var scrollHeight = (!$.browser.msie && isHorizontalScrollbar) ? 18 : 0;
            $('#ads-block').css('top', (parseInt(pageTop) - Stock.adsHeight + AV.clientHeight() - scrollHeight) + 'px');
        }
        if (Stock.currentTab != 'HO' && Stock.currentTab != 'HA' && Stock.currentTab != 'UPCOM') return;
        var pageLeft;
        if (typeof window.pageXOffset != 'undefined') {
            pageLeft = window.pageXOffset;
        }
        else if (typeof document.compatMode != 'undefined' && document.compatMode != 'BackCompat') {
            pageLeft = document.documentElement.scrollLeft;
        }
        else if (typeof document.body != 'undefined') {
            pageLeft = document.body.scrollLeft;
        }
        //$.browser.ie6 && 
        //pageLeft || 
        if (((typeof (lastPageLeft) != 'undefined' && pageLeft != lastPageLeft))) {
            //'position':'relative',
            $('#fix-header-block').css({ 'left': 0 });
        }
        lastPageLeft = pageLeft;
        if (AV.Options.tableType[Stock.floor] == 'normal' && AV.App.headerFloat != '0') {
            if (!Stock.blockBoardTopPosition) {
                Stock.updateElementsPosition();
            }
            var boardPos = Math.max(Stock.blockBoardTopPosition - 5, 0);
            Stock.visibleRow = Math.floor((pageTop - boardPos) / AV.Options.lineHeight);
            if (Stock.visibleRow < 0) Stock.visibleRow = 0;


            if (pageTop > boardPos) {
                if ($.browser.ie6) {
                    $('#fix-header-block').css('top', pageTop);
                }

                if (Stock.fixHeaderBlockDisplay != 'block') {
                    Stock.fixHeaderBlockDisplay = 'block';
                    $('#fix-header-block').show();
                    if (AV.App.indexFloat != '0') {
                        $('#session-info').insertAfter($('#header-logo-slogan'));
                    }
                    if (AV.App.selectedSymbolFloat) {
                        //$('#selectedBoardData').appendTo($('#tableFixHeader'));
                    }

                }
            } else {
                if (Stock.fixHeaderBlockDisplay == 'block') {
                    Stock.fixHeaderBlockDisplay = 'none';
                    $('#fix-header-block').hide();
                    if (AV.App.indexFloat != '0') {
                        $('#session-info').insertAfter($('#menutop-content'));
                    }
                    if (AV.App.selectedSymbolFloat) {
                        //$('#selectedBoardData').insertBefore($('#boardData'));
                    }
                }
            }
        }
        //$('#fix-header-block .BoxContent').remove();
        //setTimeout(function(){$('#fix-header-block .BoxContent').remove();}, 2000);
    },
    resize: function() {
        var width = (AV.Options.screenWidth == 'auto' || AV.Options.screenWidth == 'Auto' || AV.Options.screenWidth == '100%') ? ($.browser.msie ? (document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body.clientWidth) : window.innerWidth) : AV.Options.screenWidth;
        var pos = Math.round((width - 123 * 6) / 2);
        $('#home-tab').css('marginLeft', pos + 'px');
        pos = Math.round((width - 500) / 2 - 270);
        if (pos > 0) {
            //$('#slogan-header').css('paddingLeft',pos+'px'); 
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

    scrollTable:function(delay, inc){
		if(!Stock.contentReady)
		{
			setTimeout(function(){Stock.scrollTable(delay, inc)}, 1000);
			return;
		}
		var options = AV.Options;
		if(inc == 100)
		{
			inc = options.lineCount*$('#boardData tr:first').height();
		}
		
		if ((!options.showSymbols[Stock.floor] && parseInt(AV.sizeof(Stock.allSymbols)) > parseInt(options.lineCount)) || parseInt(AV.sizeof(options.showSymbols[Stock.floor])) > parseInt(options.lineCount)) {
			if(AV.App.fixedSelections)
			{
				$('#selectedBoardData').insertAfter($('#tableFixHeader thead'));
			}
			location = '#';
			
			$("#board-block").addClass('scrollTable');
			$("#board-block").height(AV.Options.lineCount*AV.Options.lineHeight);
	
			Stock.allowedPos = $("#stockBoard").height();// - AV.Options.lineCount*AV.Options.lineHeight;
		        	        
			$("#fix-header-block").css({position:"static", 'display':'block'});
			$('#sb-hd').hide();
			ScrollTableObj = {
				pos : 0,
				boardElem : document.getElementById('board-block'),
				allowedPos : Stock.allowedPos,
				inc: inc,
				$hiddenBoardData: $('#hiddenBoardData'),
				hiddenBoardData: document.getElementById('hiddenBoardData')
			};
			if(AV.App.fixedSelections && ScrollTableObj.$hiddenBoardData.length > 0 && inc == 1)
			{
				ScrollTableObj.inc = 1;
				ScrollTableObj.$boardData = $('#boardData');
				ScrollTableObj.boardData = document.getElementById('boardData');
				
				ScrollTableObj.$boardData.find('tr').each(function(i){
					if(i == 0)
					{
						ScrollTableObj.lineHeight = $(this).height();
					}
					else if(i > parseInt(AV.Options.lineCount) + 10)
					{
						if(!ScrollTableObj.hiddenFirstRow){
							ScrollTableObj.hiddenFirstRow = this;
						};
						this.isHidden = true;
						ScrollTableObj.$hiddenBoardData.append(this);
					}
				});
				
				ScrollTableObj.firstRow = ScrollTableObj.$boardData.get(0).firstChild;
				
				setTimeout(function(){
					$(ScrollTableObj.boardElem).height($('#stockBoard').height()-ScrollTableObj.lineHeight*10);
				}, 100);
				Stock.scrollInterval = setInterval(scrollInfiniteFunc, delay);
			}
			else
			{
				
				Stock.scrollInterval =  setInterval(scrollFunc, delay);
			}
		}
		else
		{
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
        if (AV.App.Unit[Stock.floor] && parseInt(AV.App.Unit[Stock.floor]) > 1) { s = parseInt(AV.App.Unit[Stock.floor]); number = number / s; }
		
		if(number==0 || parseFloat(number)==0) {
			return '';
		}
			
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
getOtherState = Stock.getOtherState;
getStateColor = Stock.getStateColor;
getOtherStateColor = Stock.getOtherStateColor;
function scrollFunc()
{
	var scrollTable = ScrollTableObj;
	var pos = scrollTable.pos;
	pos = pos + scrollTable.inc;
	Stock.visibleRow = Math.floor(pos/AV.Options.lineHeight);
	/*if(Stock.visibleRow != Stock.oldVisibleRow)
	{
		$('#boardData tr').each(function(i){
			if(i>= Stock.visibleRow && i<Stock.visibleRow + 30)
			{
				$(this).show();
			}
			else
			{
				$(this).hide();
			}
		});
	}
	Stock.oldVisibleRow = Stock.visibleRow;*/
	scrollTable.pos = pos;
	if(pos >= scrollTable.allowedPos)
	{
		if(pos > scrollTable.allowedPos/* + 5*scrollTable.inc*/)
		{
			scrollTable.pos = 0;
			pos = 0;
		}
		else
		{
			return;
		}
	}
	if(scrollTable.boardElem)
	{
		scrollTable.boardElem.scrollTop = pos;
	}
};
function scrollInfiniteFunc()
{
	var scrollTable = ScrollTableObj;
	var pos = scrollTable.pos;
	pos = pos + scrollTable.inc;
	if(pos >= scrollTable.lineHeight*4)
	{
		pos = 0;
		for(var i = 0; i< 4; i++)
		{
			var firstRow = scrollTable.firstRow, hiddenFirstRow = scrollTable.hiddenFirstRow;
			
			if(scrollTable.firstRow)
			{
				scrollTable.firstRow = scrollTable.firstRow.nextSibling;
				scrollTable.hiddenBoardData.appendChild(firstRow);
			}
			else
			{
				scrollTable.firstRow = scrollTable.boardData.firstChild;
			}
			if(scrollTable.hiddenFirstRow)
			{
				scrollTable.hiddenFirstRow = scrollTable.hiddenFirstRow.nextSibling;
				hiddenFirstRow.isHidden = false;
				scrollTable.boardData.appendChild(hiddenFirstRow);
			}
			else
			{
				scrollTable.hiddenFirstRow = scrollTable.hiddenBoardData.firstChild;
			}
		}
	}
	scrollTable.pos = pos;
	if(scrollTable.boardElem)
	{
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

function redirect() {
    if (location.href.indexOf("/VDSC/") != -1)
        location.href = location.href.replace("/VDSC/", "/VDSC_2/");
    else if (location.href.indexOf("/VDSC_2/") != -1)
        location.href = location.href.replace("/VDSC_2/", "/VDSC/");
}