AV.load('LSXStockBoard', function() {
    AV.LSXStockBoard.Index = AV.extend(AV.Module, {
        indexLabels: false,
        init: function() {
            Stock.index = this;
            AV.Module.prototype.init.call(this);
        },
        parseData: function() {
			//alert('parseIndexData');
            var data = Stock.indexRawData;
            if (!data) data = '||||';
            var indexes = data.split('|');
            for (var i = 0; i < indexes.length; i++) {
                if (indexes[i].replace(/[\;\s]/g, '') != '') {
                    Stock.indexes[i] = indexes[i].split(';');
                }
            }
			
            var indexes = Stock.indexes, oldIndexes = Stock.oldIndexes;
			
            for (var i = 0; i < indexes.length; i++) {
                for (var j = 0; j < indexes[i].length; j++) {
                    if (indexes[i][j] == '') {
                        indexes[i][j] = (oldIndexes[i] && oldIndexes[i][j]) ? oldIndexes[i][j] : 0;
                    }
                }
            }
            AV.ExecQueue.add(Stock.index.drawIndex, function() { return Stock.index && Stock.index.$() && Stock.index.$().length; });
            //setTimeout(, 500);
            //this.$().html();
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
                for (var i = 0, count = 3; i < count; i++) {
                    if (!indexes[i]) {
                        indexes[i] = [];
                    }
                    for (var j = 0, count2 = 5; j < count2; j++) {
                        if (typeof (indexes[i][j]) == 'undefined' || !indexes[i][j]) {
                            indexes[i][j] = '';
                        }
                    }
                    indexStatus[i] = { clss: '', emo: '' };

                    if (Math.abs(indexes[i][1]) < 0.01) {
                        indexStatus[i].clss = 'ss-basic';
                    } else {
                        if (indexes[i][1] && indexes[i][1] > 0) {
                            indexStatus[i].clss = 'ss-up';
                            indexStatus[i].emo = stock.specialSymbols[0];
                        } else {
                            indexStatus[i].clss = 'ss-down';
                            indexStatus[i].emo = stock.specialSymbols[1];
                        }
                    }
                }
                this$.html(AV.template('Index.' + stock.floor, {
                    label: label,
                    indexes: indexes,
                    indexStatus: indexStatus
                }));
            }
            else {
                if (!that.changes)
                    that.changes = {};
                var haindexext = elem('HA-index-ext');
                var count = 3;

                for (var i = 0; i < count; i++) {
                    if (indexes[i] && (typeof (oldIndexes[i]) == 'undefined' || typeof (oldIndexes[i][1]) == 'undefined' || indexes[i][1] != oldIndexes[i][1])) {
                        if (typeof (oldIndexes[i]) == 'undefined') {
                            oldIndexes[i] = {};
                        }
                        var clss, emo, oldClss, oldEmo;
                        if (!indexes[i] || !indexes[i][1] || Math.abs(indexes[i][1]) < 0.01) {
                            clss = 'ss-basic';
                            emo = Stock.specialSymbols[2];
                        } else if (indexes[i][1] && indexes[i][1] > 0) {
                            clss = 'ss-up';
                            emo = stock.specialSymbols[0];
                        } else {
                            clss = 'ss-down';
                            emo = stock.specialSymbols[1];
                        }
                        if (!oldIndexes[i] || typeof (oldIndexes[i][1]) == 'undefined') {
                            oldClss = '';
                            oldEmo = '';
                        } else if (oldIndexes[i][1] == 0) {
                            oldClss = 'ss-basic';
                            oldEmo = stock.specialSymbols[2];
                        }
                        else if (oldIndexes[i][1] > 0) {
                            oldClss = 'ss-up';
                            oldEmo = stock.specialSymbols[0];
                        } else {
                            oldClss = 'ss-down';
                            oldEmo = stock.specialSymbols[1];
                        }
                        if (clss != oldClss) {
                            var obj = elem('index-' + i);
                            if (obj) obj.className = clss;
                        }

                        if (emo != oldEmo) {
                            var obj = elem('index-emo-' + i);
                            if (obj) obj[(emo.length > 10) ? 'innerHTML' : AV.innerText] = emo;
                        }
                    }
                    if (!that.changes[i]) that.changes[i] = {};
                    var count2 = 9 ;
                    //alert(count2);
                    for (var j = 0; j < count2; j++) {
                        //if(j==8)alert(indexes[i][j]);
                        if (indexes[i] && (!oldIndexes[i] || indexes[i][j] != oldIndexes[i][j])) {
                            var obj = elem('index-' + j + '-' + i);
                            if (obj) {
                                var value = (indexes[i][j] == '' || indexes[i][j] == '0') ? oldIndexes[i][j] : indexes[i][j];
                                if (value != 'undefined' && value!='' && value!=null)
                                    obj[AV.innerText] = AV.numberFormat(((j == 1 || j == 2) ? Stock.diff(indexes[i][j]) : value));
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