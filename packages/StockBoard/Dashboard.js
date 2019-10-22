Stock.Dashboard = AV.extend(AV.Module, {
    vnNData: {},
    vnYData: {},
    hnxNData: {},
    hnxYData: {},
    lastRefVNIndex: 0,
    lastRefHNXIndex: 0,
    currentRefVNIndex: 0,
    currentRefHNXIndex: 0,
    advanceColor:'#0d7312',
    declineColor:'#d20c1f',
    breaktimeColor: '#282828',
    init: function () {
        Stock.dashBoard = this;
        AV.Module.prototype.init.call(this);
    },
    draw: function () {
        return AV.template('DashboardContent');
    },
	getDashboardData:function(indexName){
		var that = this;
		$.getJSON('http://banggia.vfpress.vn/DashboardHandler.ashx?type=8&indexName='+indexName+'&callback=?', function (data) {
			var staticData = data.StaticData;
			var realtimeData = data.RealtimeData;
			var rsiData = data.RSIData;
			
			if(staticData != null){
				$('#'+indexName+'-TotalShares5dayAvg').html(AV.numberFormat(staticData.TotalShares5dayAvg / 1000000,2));
				$('#'+indexName+'-TotalShares52wHigh').html(AV.numberFormat(staticData.TotalShares52wHigh / 1000000,2));
				$('#'+indexName+'-Highest52w').html(staticData.Highest52w);
				$('#'+indexName+'-Lowest52w').html(staticData.Lowest52w);
				$('#'+indexName+'-Return1Month').html(AV.numberFormat(staticData.Return1Month,2));
				$('#'+indexName+'-Return3Month').html(AV.numberFormat(staticData.Return3Month,2));
				$('#'+indexName+'-YTD').html(AV.numberFormat(staticData.YTD,2));
				$('#'+indexName+'-PE').html(AV.numberFormat(staticData.PE,2));
				$('#'+indexName+'-PB').html(AV.numberFormat(staticData.PB,2));
				$('#'+indexName+'-DividendYield').html(AV.numberFormat(staticData.DividendYield,2));
				$('#'+indexName+'-MarketValues').html(AV.numberFormat(staticData.MarketValues / 1000,2));
			}
			
			if(realtimeData != null){
				$('#'+indexName+'-Highest').html(realtimeData.Highest);
				$('#'+indexName+'-Lowest').html(realtimeData.Lowest);
				$('#'+indexName+'-RefIndex').html(realtimeData.RefIndex);
				$('#'+indexName+'-TotalShares').html(AV.numberFormat(realtimeData.TotalShares / 1000000,2));
				$('#'+indexName+'-CurrentIndex').html(realtimeData.CurrentIndex);
				$('#'+indexName+'-TotalBid').html(AV.numberFormat(realtimeData.TotalBid / 1000000,2));
				$('#'+indexName+'-TotalBidValues').html(AV.numberFormat(realtimeData.TotalBidValues / 1000000000,2));
				$('#'+indexName+'-TotalOffer').html(AV.numberFormat(realtimeData.TotalOffer / 1000000,2));
				$('#'+indexName+'-TotalOfferValues').html(AV.numberFormat(realtimeData.TotalOfferValues / 1000000000,2));
			}
			
			if(rsiData != null){
				gaugeData = new Array();
	            gaugeData[0] = rsiData.RSIValue;
				that.getRSIChart(indexName+'-rsi-chart', 'RSI', gaugeData);
			}
		});
	},
    drawIndexChart: function (indexName, divName) {
        var that = this;
        Stock.dashBoard.getRealtimeIndex(indexName, 1, -1);
        Stock.dashBoard.getRealtimeIndex(indexName, 2, -1);

        setTimeout(function () {
            $('#' + divName).highcharts('StockChart', {
                chart: {
                    events: {
                        load: function () {

                            /*
							// set up the updating of the chart each second
							var series = this.series[1];
							setInterval(function() {
								var x = (new Date()).getTime(), // current time
								y = Math.round(Math.random() * 100);
								series.addPoint([x, y], true, true);
							}, 60000);
							*/
                        }
                    },
                    backgroundColor: "#000",
                    margin: [30, 0, 30, 0]
                },
				plotOptions: {
	                areaspline: {
                    	lineWidth: 1
					}
				},
                tooltip: {
                    backgroundColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                           [0, 'rgba(96, 96, 96, .8)'],
                           [1, 'rgba(16, 16, 16, .8)']
                        ]
                    },
                    borderWidth: 0,
                    style: {
                        color: '#FFF'
                    }
                },
                navigation: {
                    buttonOptions: {
                        symbolStroke: '#DDDDDD',
                        hoverSymbolStroke: '#FFFFFF',
                        theme: {
                            fill: {
                                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                                stops: [
                                   [0.4, '#606060'],
                                   [0.6, '#333333']
                                ]
                            },
                            stroke: '#000000'
                        }
                    }
                },
                rangeSelector: {
                    buttons: [{
                        type: 'hour',
                        count: 1,
                        text: '1h'
                    }, {
                        type: 'all',
                        count: 1,
                        text: 'All'
                    }],
                    selected: 1,
                    enabled: 1,
                    inputEnabled: false
                },
                scrollbar: {
                    enabled: false
                },
                navigator: {
                    enabled: false
                },
                title: {
                    text: indexName,
                    margin: 0,
                    style: {
                        color: '#FFF',
                        font: 'bold 16px "Trebuchet MS", Verdana, sans-serif'
                    }
                },
                exporting: {
                    enabled: false
                },
                credits: {
                    href: 'http://vfpress.vn',
                    text: 'vfpress.vn'
                },
                xAxis: {
                    type: 'datetime'
                },
                yAxis: {
                    plotLines: [{
                        value: indexName == 'VNIndex' ? that.lastRefVNIndex : that.lastRefHNXIndex,
                        color: 'green',
                        dashStyle: 'shortdash',
                        width: 1,
                        zIndex: 5,
                        label: {
                            text: indexName == 'VNIndex' ? that.lastRefVNIndex : that.lastRefHNXIndex,
                            style: {
                                color: '#FFF'
                            },
                            align: 'left',
                            x: 30
                        }
                    }, {
                        value: indexName == 'VNIndex' ? that.currentRefVNIndex : that.currentRefHNXIndex,
                        color: 'red',
                        dashStyle: 'shortdash',
                        width: 1,
                        zIndex: 10,
                        label: {
                            text: indexName == 'VNIndex' ? that.currentRefVNIndex : that.currentRefHNXIndex,
                            align: 'right',
                            style: {
                                color: '#FFF'
                            },
                            x: -5
                        }
                    }]
                },
                series: [{
                    name: 'Hôm trước',
                    data: indexName == 'VNIndex' ? that.vnYData : that.hnxYData,
                    type: 'areaspline',
                    threshold: null,
                    tooltip: {
                        valueDecimals: 2
                    },
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [[0, '#1f4569'], [1, '#1e4568']]
                    },
                    color: '#f2f2f2',
                    marker: {
                        lineWidth: 1
                    }
                },
				{
				    name: 'Hôm nay',
				    data: indexName == 'VNIndex' ? that.vnNData : that.hnxNData,
				    type: 'areaspline',
				    threshold: null,
				    tooltip: {
				        style: {
				            color: '#FFF'
				        },
				        valueDecimals: 2
				    },
				    fillColor: {
				        linearGradient: {
				            x1: 0,
				            y1: 0,
				            x2: 0,
				            y2: 1
				        },
				        stops: [[0, '#ea6006'], [1, '#212f3d']]
				    },
				    color: '#f2f2f2',
				    marker: {
				        lineWidth: 1
				    }
				}
                ]
            });
        }, 1500);
    },
    getRealtimeIndex: function (indexName, type, lastTime) {
        var that = this;
        $.getJSON('http://banggia.vfpress.vn/DashboardHandler.ashx?type=' + type + '&last=' + lastTime + '&indexName=' + indexName + '&callback=?', function (data) {
            var result = [];
            var rows = data.rows;
            for (var i = 0; i < rows.length; i++) {
                var price = rows[i].row.price;
                var time = rows[i].row.time;
                result.push([time, price]);
            }

            if (type == 2) {
                if (indexName == 'VNIndex') {
                    that.vnYData = result;
                    that.lastRefVNIndex = data.refPrice;
                }
                else {
                    that.hnxYData = result;
                    that.lastRefHNXIndex = data.refPrice;
                }
            } else {
                if (indexName == 'VNIndex') {
                    that.vnNData = result;
                    that.currentRefVNIndex = data.refPrice;
                }
                else {
                    that.hnxNData = result;
                    that.currentRefHNXIndex = data.refPrice;
                }
            }
            return result;
        });
    },
    drawChart: function (title, floor_code) {
        var that = this;
        var advances = '', dMin = '', dMax = '';
        var declines = '';
        var jsonData = '';
        var arrAdvances = new Array();
        var arrDeclines = new Array();
        var arrBids = new Array();
        var arrOffers = new Array();
        var arrFgs = new Array();
        var arrFgValues = new Array();
        var arrDoms = new Array();
        var arrMbs = new Array();

        var arrTFgs = new Array();
        var arrFgTValues = new Array();
        var arrIndexes = new Array();

        var arrTDoms = new Array();
        var arrTMbs = new Array();
        var tD = new Date();

        $.getJSON('http://banggia.vfpress.vn/DashboardHandler.ashx?type=3&callback=?', function (data) {
            jsonData = data;
            today = jsonData.today;
            yesterday = jsonData.yesterday;

            gauge = today.gauge;
            tDiff = today.diff;
            tDiffRate = today.diffrate;

            times = yesterday.times;
            tTimes = today.times;

            todayDate = today.date;
            yesterdayDate = yesterday.date;

            advances = today.advances;
            declines = today.declines;

            //alert(advances.length+'---'+declines.length);

            fgs = today.fg;

            fgValues = yesterday.fg_value;
            fgTValues = today.fg_value;

            doms = today.dom;
            mbs = today.mb;

            indexes = today.index;

            total_bid = today.total_bid;
            total_offer = today.total_offer;

            dMin = today.min;
            dMax = today.max;

            var sMin = (dMin + '').split(';');
            var sMax = (dMax + '').split(';');

            dateMin = Date.UTC(tD.getFullYear(), tD.getMonth(), tD.getDay(), sMin[0], sMin[1], sMin[2]);
            dateMax = Date.UTC(tD.getFullYear(), tD.getMonth(), tD.getDay(), sMax[0], sMax[1], sMax[2]);

            dSeparateMin = today.separateMin;
            dSeparateMax = today.separateMax;

            var sSeparateMin = (dSeparateMin + '').split(';');
            var sSeparateMax = (dSeparateMax + '').split(';');

            dateSeparateMin = Date.UTC(tD.getFullYear(), tD.getMonth(), tD.getDay(), sSeparateMin[0], sSeparateMin[1], sSeparateMin[2]);
            dateSeparateMax = Date.UTC(tD.getFullYear(), tD.getMonth(), tD.getDay(), sSeparateMax[0], sSeparateMax[1], sSeparateMax[2]);

            var dateLast = today.last + '';
            //alert(advances);
            var fgValue = 0;
            for (i = 0; i < tTimes.length; i++) {
                try
                {
                    var time = tTimes[i];
                    var advance = parseInt(advances[i]);
                    var decline = parseInt(declines[i]);
                    var bid = parseFloat(total_bid[i]);
                    var offer = parseFloat(total_offer[i]);
                    var fg = parseFloat(fgs[i]);
                    
                    if(fgTValues[i] != null)
                     fgValue = parseFloat(fgTValues[i]);
                    var dom = parseFloat(doms[i]);
                    var mb = parseFloat(mbs[i]);
                    var index = parseFloat(indexes[i]);

                    var sTime = (time + '').split(';');
                    date = Date.UTC(tD.getFullYear(), tD.getMonth(), tD.getDay(), sTime[0], sTime[1], 0);
                    arrAdvances.push([date, advance]);
                    arrDeclines.push([date, decline]);
                    arrBids.push([date, bid]);
                    arrOffers.push([date, offer]);
                    arrFgs.push([date, fg]);
                    if (fgValue != null)
                        arrFgValues.push([date, fgValue]);
                    arrDoms.push([date, dom]);
                    arrMbs.push([date, mb]);
                    if (index > 0)
                        arrIndexes.push([date, index]);
                }
                catch(e){
                    console.log(e);
                }
            }

            //alert(arrDeclines);
            //Get AD data
            that.getADChart(title, floor_code, 'CP Tăng / CP Giảm', '', dateMin, dateMax, dateSeparateMin, dateSeparateMax, arrAdvances, arrDeclines, dateLast);

            //Get BO data
            that.getBidOfferChart(title, floor_code, 'Tổng cầu/Tổng cung', '', dateMin, dateMax, dateSeparateMin, dateSeparateMax, arrBids, arrOffers, dateLast);

            for (i = 0; i < times.length; i++) {
                var time = times[i];
                var fgValue = parseFloat(fgValues[i]);

                var sTime = (time + '').split(';');
                date = Date.UTC(tD.getFullYear(), tD.getMonth(), tD.getDay(), sTime[0], sTime[1], 0);

                if (fgValue != 'NaN')
                    arrFgTValues.push([date, fgValue]);
            }

            //console.log(arrFgTValues);
            //console.log(arrFgValues);
            //Get FG data
            that.getFGChart(title + ' Nước ngoài', floor_code, 'Foreign / Domestic value', '', dateMin, dateMax, dateSeparateMin, dateSeparateMax, arrFgValues, arrFgTValues, arrDoms, dateLast, todayDate, yesterdayDate);

            //Get Gauge data
            gaugeData = new Array();
            gaugeData[0] = gauge;
            that.getFearGreedChart(title + ' Fear-Greed Indicator', floor_code, gaugeData);
        });
    },
    getADChart: function (title, chartName, sTitle, subtitle, dMin, dMax, dSeparateMin, dSeparateMax, advanceData, declineData, dLastTime) {
        //Ve bieu do AD trong ngay
        var chart = new Highcharts.Chart({
            chart: {
                renderTo: 'chart-ad',
                type: 'spline',
                backgroundColor: "#000",
                margin: [15, 0, 15, 0]
            },
            tooltip: {
                backgroundColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                       [0, 'rgba(96, 96, 96, .8)'],
                       [1, 'rgba(16, 16, 16, .8)']
                    ]
                },
                borderWidth: 0,
                style: {
                    color: '#FFF'
                },
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
                            Highcharts.dateFormat('%H:%M', this.x) + ': ' + this.y;
                }
            },
            navigation: {
                buttonOptions: {
                    symbolStroke: '#DDDDDD',
                    hoverSymbolStroke: '#FFFFFF',
                    theme: {
                        fill: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [
                               [0.4, '#606060'],
                               [0.6, '#333333']
                            ]
                        },
                        stroke: '#000000'
                    }
                }
            }, scrollbar: {
                enabled: false
            },
            navigator: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            credits: {
                href: 'http://vfpress.vn',
                text: 'vfpress.vn'
            },
            title: {
                text: 'CP Tăng/CP Giảm',
                style: {
                    color: '#fff',
					font: 'bold 12px Tahoma,Geneva,sans-serif'
                }
            },
            legend: {
                enabled: false
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: { // don't display the dummy year
                    second: '%H:%M:%S',
                    minute: '%H:%M',
                    hour: '%l%P',
                    day: "%e. %b",
                    week: '%e. %b',
                    month: '%b \'%y',
                    year: '%Y'
                },
                min: dMin,
                max: dMax,
                plotBands: [{ // break time
                    from: dSeparateMin,
                    to: dSeparateMax,
                    color: Stock.dashBoard.breaktimeColor
                }]
            },
            yAxis: { // Primary yAxis
                labels: {
                    formatter: function () {
                        return this.value;
                    }
                },
                title: {
                    text: 'Số lượng CP'
                },
                gridLineWidth: 0
            },
            plotOptions: {
                spline: {
                    lineWidth: 2,
                    states: {
                        hover: {
                            lineWidth: 2
                        }
                    },
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                enabled: true,
                                symbol: 'circle',
                                radius: 5,
                                lineWidth: 2
                            }
                        }
                    }
                }
            },
            series: [{
                name: 'Advances-Tăng',
                color: Stock.dashBoard.advanceColor,
                data: advanceData
            }, {
                name: 'Declines-Giảm',
                color: Stock.dashBoard.declineColor,
                data: declineData
            }]
        });

        return chart;
    },
    getBidOfferChart: function (title, chartName, sTitle, subtitle, dMin, dMax, dSeparateMin, dSeparateMax, bidData, offerData, dLastTime) {
        //Ve bieu do Bid/Offer
        var chart = new Highcharts.Chart({
            chart: {
                renderTo: 'chart-bidoffer',
                type: 'spline',
                backgroundColor: "#000",
                margin: [15, 0, 15, 0]
            },
            tooltip: {
                backgroundColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                       [0, 'rgba(96, 96, 96, .8)'],
                       [1, 'rgba(16, 16, 16, .8)']
                    ]
                },
                borderWidth: 0,
                style: {
                    color: '#FFF'
                },
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
							Highcharts.dateFormat('%H:%M', this.x) + ': ' + this.y;
                }
            },

            title: {
                text: 'Tổng cầu/Tổng cung',
                style: {
                    color: '#fff',
					font: 'bold 11px Tahoma,Geneva,sans-serif'
                }
            },
            legend: {
                enabled: false
            },
            navigation: {
                buttonOptions: {
                    symbolStroke: '#DDDDDD',
                    hoverSymbolStroke: '#FFFFFF',
                    theme: {
                        fill: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [
                               [0.4, '#606060'],
                               [0.6, '#333333']
                            ]
                        },
                        stroke: '#000000'
                    }
                }
            }, scrollbar: {
                enabled: false
            },
            navigator: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            credits: {
                href: 'http://vfpress.vn',
                text: 'vfpress.vn'
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: { // don't display the dummy year
                    second: '%H:%M:%S',
                    minute: '%H:%M',
                    hour: '%l%P',
                    day: "%e. %b",
                    week: '%e. %b',
                    month: '%b \'%y',
                    year: '%Y'
                },
                min: dMin,
                max: dMax,
                plotBands: [{ // break time
                    from: dSeparateMin,
                    to: dSeparateMax,
                    color: Stock.dashBoard.breaktimeColor
                }]
            },
            yAxis: { // Primary yAxis
                labels: {
                    formatter: function () {
                        return this.value + ' bil';
                    }
                },
                title: {
                    text: 'Tỷ'
                },
                gridLineWidth: 0
            },
            plotOptions: {
                spline: {
                    lineWidth: 2,
                    states: {
                        hover: {
                            lineWidth: 2
                        }
                    },
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                enabled: true,
                                symbol: 'circle',
                                radius: 5,
                                lineWidth: 2
                            }
                        }
                    }
                }
            },
            series: [{
                name: 'Tổng cầu',
                color: Stock.dashBoard.advanceColor,
                data: bidData,
				tooltip: {
                   valueDecimals: 2
                }
            }, {
                name: 'Tổng cung',
                color: Stock.dashBoard.declineColor,
                data: offerData,
				tooltip: {
                   valueDecimals: 2
                }
            }]
        });

        return chart;
    },
    getFGChart: function (title, chartName, sTitle, subtitle, dMin, dMax, dSeparateMin, dSeparateMax, todayFgValue, yesterdayFgValue, domValue, dLastTime, todayName, yesterdayName) {
        //Ve bieu do GDNN
        var chart = new Highcharts.Chart({
            chart: {
                renderTo: 'chart-fg',
                type: 'spline',
                backgroundColor: "#000",
                margin: [15, 0, 15, 0]
            },
            tooltip: {
                backgroundColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                       [0, 'rgba(96, 96, 96, .8)'],
                       [1, 'rgba(16, 16, 16, .8)']
                    ]
                },
                borderWidth: 0,
                style: {
                    color: '#FFF'
                },
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
							Highcharts.dateFormat('%H:%M', this.x) + ': ' + this.y + ' bil';
                },
                valueDecimals: 2
            },

            title: {
                text: 'Nước ngoài mua',
                style: {
                    color: '#fff',
					font: 'bold 12px Tahoma,Geneva,sans-serif'
                }
            },
            legend: {
                enabled: false
            },
            navigation: {
                buttonOptions: {
                    symbolStroke: '#DDDDDD',
                    hoverSymbolStroke: '#FFFFFF',
                    theme: {
                        fill: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [
                               [0.4, '#606060'],
                               [0.6, '#333333']
                            ]
                        },
                        stroke: '#000000'
                    }
                }
            }, scrollbar: {
                enabled: false
            },
            navigator: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            credits: {
                href: 'http://vfpress.vn',
                text: 'vfpress.vn'
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: { // don't display the dummy year
                    second: '%H:%M:%S',
                    minute: '%H:%M',
                    hour: '%l%P',
                    day: "%e. %b",
                    week: '%e. %b',
                    month: '%b \'%y',
                    year: '%Y'
                },
                min: dMin,
                max: dMax,
                plotBands: [{ // break time
                    from: dSeparateMin,
                    to: dSeparateMax,
                    color: Stock.dashBoard.breaktimeColor
                }],
                tickmarkPlacement: 'on'
            },
            yAxis: [{ // Primary yAxis
                labels: {
                    formatter: function () {
                        return this.value + ' bil';
                    },
                    style: {
                        color: Stock.dashBoard.declineColor
                    }
                },
                title: {
                    text: 'Today',
                    style: {
                        color: Stock.dashBoard.declineColor
                    }
                },
                gridLineWidth: 0
            }, { // Secondary yAxis
                title: {
                    text: 'Yesterday',
                    style: {
                        color: Stock.dashBoard.advanceColor
                    }
                },
                labels: {
                    formatter: function () {
                        return this.value + ' bil';
                    },
                    style: {
                        color: Stock.dashBoard.advanceColor
                    }
                },
                opposite: true,
                gridLineWidth: 0
            }],
            plotOptions: {
                spline: {
                    lineWidth: 2,
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                enabled: true,
                                symbol: 'circle',
                                radius: 5,
                                lineWidth: 2
                            }
                        }
                    }
                }
            },
            series: [{
                name: yesterdayName,
                lineWidth: 2,
                color: Stock.dashBoard.advanceColor,
                data: yesterdayFgValue
            }, {
                name: todayName,
                lineWidth: 2,
                color: Stock.dashBoard.declineColor,
                data: todayFgValue
            }

            ]
        });

        return chart;
    },
    getFearGreedChart: function (title, floor_code, gaugeData) {
        //Ve bieu do Fear/Greed
        var chart = new Highcharts.Chart({
            chart: {
                renderTo: 'chart-feargreed',
                type: 'gauge',
                backgroundColor: "#000",
                margin: [25, 0, 0, 0]
            },
            title: {
                text: 'Sợ hãi/Tham lam',
                margin: 0,
                style: {
                    color: '#FFF',
                    font: 'bold 12px Tahoma,Geneva,sans-serif'
                }
            },
            exporting: {
                enabled: false
            },
            credits: {
                href: 'http://vfpress.vn',
                text: 'vfpress.vn'
            },
            pane: {
                startAngle: -150,
                endAngle: 150
            },

            yAxis: {
                min: 0,
                max: 100,
                lineColor: '#339',
                tickColor: '#339',
                minorTickColor: '#339',
                offset: -5,
                lineWidth: 2,
                labels: {
                    distance: -15,
                    rotation: 'auto'
                },
                tickLength: 5,
                minorTickLength: 5,
                endOnTick: false
            },

            series: [{
                name: 'Fear/Greed',
                data: gaugeData,
                dataLabels: {
                    formatter: function () {
                        return this.y;
                    },
                    backgroundColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, '#DDD'],
                            [1, '#FFF']
                        ]
                    }
                }
            }]
        });
    },
	getRSIChart: function (chartName, title, gaugeData) {
        //Ve bieu do Fear/Greed
        var chart = new Highcharts.Chart({
            chart: {
                renderTo: chartName,
                type: 'gauge',
                backgroundColor: "#000",
                margin: [25, 0, 0, 0]
            },
            title: {
                text: title,
                margin: 0,
                style: {
                    color: '#FFF',
                    font: 'bold 16px "Trebuchet MS", Verdana, sans-serif'
                }
            },
            exporting: {
                enabled: false
            },
            credits: {
                href: 'http://vfpress.vn',
                text: 'vfpress.vn'
            },
            pane: {
                startAngle: -150,
                endAngle: 150
            },

            yAxis: {
                min: 0,
                max: 100,
                lineColor: '#339',
                tickColor: '#339',
                minorTickColor: '#339',
                offset: -5,
                lineWidth: 2,
                labels: {
                    distance: -15,
                    rotation: 'auto'
                },
                tickLength: 5,
                minorTickLength: 5,
                endOnTick: false
            },

            series: [{
                name: 'RSI',
                data: gaugeData,
                dataLabels: {
                    formatter: function () {
                        return this.y;
                    },
                    backgroundColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, '#DDD'],
                            [1, '#FFF']
                        ]
                    }
                }
            }]
        });
    }
});