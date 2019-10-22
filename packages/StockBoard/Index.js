AV.load('StockBoard', function() {
    AV.StockBoard.Index = AV.extend(AV.Module, {
        indexLabels: false,
        dashBoardIndex: false,
        init: function() {
            Stock.index = this;
            AV.Module.prototype.init.call(this);
        },
        updateFullIndex: function() {
            $.ajax({ type: "GET",
                url: Stock.dataFileName('0' + (Stock.localhost ? ('-' + Stock.nextFile) : (Stock.floor == 'DOUBLE') ? '&s=' + s : '')),
                cache: false,
                async: false,
                success: function(data) {
                    var stock = Stock;
                    data = data.split('@');
                    if (data[2]) {
                        stock.indexRawData = data[2];
                        if (stock.index) {
                            setTimeout(function() { Stock.index.parseData(); }, 10);
                        }
                        else {
                            AV.ExecQueue.add(function() { Stock.index.parseData(); }, function() { return Stock.index; });
                        }
                    }
                    else {
                        setTimeout(Stock.index.drawIndex, 20);
                    }
                },
                complete: function() {

                }
            });
        },
        parseData: function(init) {
            var data;
            data = Stock.indexRawData;
            //console.log(data);
            Stock.index.analyzeIndex(data, init);
        },
        analyzeIndex: function(data) {
            if (!data) data = 'VNIndex|VNIndex-1|VNIndex-2|VNIndex-3|VNIndex-PT|VN30|VN100|VNSML|VNMID|VNALL|HNXLCap|HNXMSCap|HNXFin|HNXCon|HNX30|HNXFFIndex|HNXIndex|HNXMan|HNXUpcomIndex|';
            var indexes = data.split('|');
            //console.log(indexes);
            if (data.indexOf(':') > 0) {
                //Neu la thay doi
                //console.log(indexes);
                for (var i = 0; i < indexes.length; i++) {
                    if (indexes[i] !== '') {
                        var tmp = indexes[i].split(';');
                        var indexName = tmp[0];
                        //if (indexName.indexOf('VNIndex') != -1)
                        //console.log(indexes[i]);
                        try {
                            if (Stock.indexes[indexName] && (typeof (Stock.indexes[indexName]) !== 'undefined')) {
                                Stock.indexes[indexName][1] = tmp[1];
                                for (var j = 2; j < tmp.length; j++) {
                                    //Di lan luot tung o de replace du lieu
                                    if (tmp[j] !== '') {
                                        var change = tmp[j].split(':');
                                        Stock.indexes[indexName][parseInt(change[0])] = change[1];
                                    }
                                }
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }
            }
            else {
                for (var i = 0; i < indexes.length; i++) {
                    if (indexes[i].replace(/[\;\s]/g, '') !== '') {
                        var tmp = indexes[i].split(';');
                        Stock.indexes[i] = tmp;
                        Stock.indexes[tmp[0]] = tmp;
                    }
                }
            }

            var indexes = Stock.indexes, oldIndexes = Stock.oldIndexes;

            for (var i = 0; i < indexes.length; i++) {
                if (indexes[i] != 'undefined') {
                    try {
                        for (var j = 0; j < indexes[i].length; j++) {
                            if (indexes[i][j] === '') {
                                indexes[i][j] = (oldIndexes[i] && oldIndexes[i][j]) ? oldIndexes[i][j] : 0;
                            }
                        }
                    }
                    catch (e) {
                    }
                }
            }

            AV.ExecQueue.add(Stock.index.drawIndex, function() { return Stock.index && Stock.index.$() && Stock.index.$().length; });
        },

        drawIndex: function() {
            var that = Stock.index;
            var stock = Stock, indexes = stock.indexes, oldIndexes = stock.oldIndexes;

            if (!that.isShowIndex) {
                var this$ = that.$();
                if (!this$ || this$.length <= 0) return;
                that.isShowIndex = true;
                if (!that.indexLabels) {
                    that.indexLabels = [
					    [Lang.Sess + ' 1', Lang.sumVol, Lang.sumVal], [Lang.Sess + ' 2', Lang.sumVol, Lang.sumVal], [Lang.Sess + ' 3', Lang.sumVol, Lang.sumVal], [Lang.putThrought, Lang.sumVol, Lang.sumVal]
                    ];
                }
                var label = that.indexLabels;
                var indexStatus = [];
                var count;

                for (var i = 0; i < indexes.length; i++) {
                    if (!indexes[i]) {
                        indexes[i] = [];
                    }

                    for (var j = 0; j < indexes[i].length; j++) {
                        if (typeof (indexes[i][j]) === 'undefined' || !indexes[i][j]) {
                            indexes[i][j] = '';
                        }
                    }

                    indexStatus[i] = { clss: '', emo: '' };

                    if (Math.abs(indexes[i][3]) < 0.01) {
                        indexStatus[i].clss = 'ss-basic';
                    } else {
                        if (indexes[i][3] && indexes[i][3] > 0) {
                            indexStatus[i].clss = 'ss-up';
                            indexStatus[i].emo = stock.specialSymbols[0];
                        } else {
                            indexStatus[i].clss = 'ss-down';
                            indexStatus[i].emo = stock.specialSymbols[1];
                        }
                    }
                }

                var prefix = '';
                if (location.href.indexOf('HOSE') > 0) {
                    prefix = '.HO';
                } else if (location.href.indexOf('HASE') > 0) {
                    prefix = '.HA';
                } else if (location.href.indexOf('UPCOM') > 0) {
                    prefix = '.UPCOM';
                } else if (location.href.indexOf('VN30INDEX') > 0) {
                    prefix = '.VN30';
                } else if (location.href.indexOf('HNX30INDEX') > 0) {
                    prefix = '.HNX30';
                }
                this$.html(AV.template('Index' + prefix, {
                    label: label,
                    indexes: indexes,
                    indexStatus: indexStatus
                }));

                try {
                    Stock.setDate(Stock.serverTime);
                    Stock.setTime(Stock.serverTime);
                    Stock.setMarketStatus(Stock.getMarketStatus());
                }
                catch (e) {
                    console.log(e);
                }
            }
            else {
                if (!that.changes)
                    that.changes = {};

                var count = indexes.length;

                for (var i = 0; i < count; i++) {
                    if (indexes[i] && (typeof (oldIndexes[i]) === 'undefined' || typeof (oldIndexes[i][1]) === 'undefined' || indexes[i][2] !== oldIndexes[i][2])) {
                        if (typeof (oldIndexes[i]) === 'undefined') {
                            oldIndexes[i] = {};
                        }

                        var clss, emo, oldClss, oldEmo;

                        if (!indexes[i] || !indexes[i][3] || Math.abs(indexes[i][3]) < 0.01) {
                            clss = 'ss-basic';
                            emo = Stock.specialSymbols[3];
                        } else if (indexes[i][3] && indexes[i][3] > 0) {
                            clss = 'ss-up';
                            emo = stock.specialSymbols[0];
                        } else {
                            clss = 'ss-down';
                            emo = stock.specialSymbols[1];
                        }
                        if (!oldIndexes[i] || typeof (oldIndexes[i][3]) === 'undefined') {
                            oldClss = '';
                            oldEmo = '';
                        } else if (oldIndexes[i][3] === 0) {
                            oldClss = 'ss-basic';
                            oldEmo = stock.specialSymbols[2];
                        }
                        else if (oldIndexes[i][3] > 0) {
                            oldClss = 'ss-up';
                            oldEmo = stock.specialSymbols[0];
                        } else {
                            oldClss = 'ss-down';
                            oldEmo = stock.specialSymbols[1];
                        }

                        var obj = elem('index-' + i);
                        if (obj) obj.className = clss;

                        var objEmo = elem('index-emo-' + i);
                        if (objEmo) objEmo[(emo.length > 10) ? 'innerHTML' : AV.innerText] = emo;
                    }

                    if (!that.changes[i]) that.changes[i] = {};

                    var count2 = indexes[i].length;

                    for (var j = 0; j < count2; j++) {
                        if (indexes[i] && (!oldIndexes[i] || indexes[i][j] != oldIndexes[i][j])) {
                            var obj = elem('index-' + j + '-' + i);
                            if (obj) {
                                var value = (indexes[i][j] == '' || indexes[i][j] == '0') ? oldIndexes[i][j] : indexes[i][j];
                                if (j == 1) {
                                    //Neu la trang thai thi truong thi xu ly rieng
                                    obj[AV.innerText] = AV.StockBoard.getMarketStatus(value);
                                }
                                else {
                                    if (value != 'undefined' && value != '' && value != null)
                                        obj[AV.innerText] = AV.numberFormat(((j == 3 || j == 4) ? Stock.diff(indexes[i][j]) : value));
                                }

                                if (AV.App.indexHightLightColor != 0 && typeof (oldIndexes[i]) != 'undefined' && !that.dashBoardIndex) {
                                    obj.style.backgroundColor = AV.App.indexHightLightColor ? AV.App.indexHightLightColor : '#AAAAAA';
                                }
                            }

                            if (typeof (oldIndexes[i]) != 'undefined') {
                                that.changes[i][j] = 2;
                            }

                            oldIndexes[i][j] = indexes[i][j];
                        }
                        else if (that.changes[i][j]) {
                            that.changes[i][j]--;
                            if (!that.changes[i][j]) {
                                var obj = elem('index-' + j + '-' + i);
                                if (obj) obj.style.backgroundColor = '';
                            }
                        }
                    }
                }
            }
        }
    });
});