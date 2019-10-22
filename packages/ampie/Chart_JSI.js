var symbol = '';
var name = '';
var check = false;

function TotalSecData() {
    if (AV.StockBoard.currentSymbol == '') {
        $('#realtime-chart').css({ 'display': 'none' });
        return;
    }
    var obj = AV.StockBoard.currentSymbol.split('-');
    if (obj.length > 0) {
        $('#realtime-chart').css({ 'display': 'block' });
        if (symbol != obj[0]) check = false;
        symbol = obj[0];
        name = obj[1];
    }
    if (symbol.length > 0) {
        realtimeChartUpdate();
    }
}

function realtimeChartUpdate() {
    DrawRealtimeChart(symbol, 'RealtimeChart', 0);
}

function basicChartUpdate() {

    if (AV.StockBoard.floor == 'HO')
        symbol = 'VNIndex';
    else if (AV.StockBoard.floor == 'HA')
        symbol = 'HASTCIndex';
    else if (AV.StockBoard.floor == 'UPCOM')
        symbol = 'UPCOMIndex';

    DrawBasicChart(symbol, 1);
}

function DrawBasicChart(SymbolId, type) {

    /*var so;
    if(type==1)
    so = new SWFObject("/packages/ampie/amline.swf", "amline", "250", "150", "8");
    else
    so = new SWFObject("/packages/ampie/amline.swf", "amline", "350", "300", "8");
    so.addVariable("path", "/packages/ampie/");
    var date = new Date();
    so.addVariable("data_file", encodeURIComponent("/RealTime/" + SymbolId + ".txt"));
    so.addVariable("settings_file", encodeURIComponent("/packages/ampie/settings.xml"));
    so.write('BasicChart');*/
    var path = '/RealTime/chart/';
    var fileName = '';
    if (SymbolId == 'VNIndex') fileName = 'hose_black.png';
    else if (SymbolId == 'HASTCIndex') fileName = 'hnx_black.png';
    else if (SymbolId == 'UPCOMIndex') fileName = 'upcom_black.png';

    if (AV.Options.boardColor) {
        if (AV.Options.boardColor == 'White') {
            if (SymbolId == 'VNIndex') fileName = 'hose_white.png';
            else if (SymbolId == 'HASTCIndex') fileName = 'hnx_white.png';
            else if (SymbolId == 'UPCOMIndex') fileName = 'upcom_white.png';
        }
    }
    //alert('<img src="'+path+fileName+'" />');
    $('#BasicChartImg').attr('src', path + fileName + '?t=' + (new Date().getTime()));
};

function DrawRealtimeChart(SymbolId, type) {
    $('#chart-title').html(AV.StockBoard.currentSymbol);
    var so;
    if (type == 1)
        so = new SWFObject("/packages/ampie/amline.swf", "amline", "250", "150", "8");
    else
        so = new SWFObject("/packages/ampie/amline.swf", "amline", "450", "200", "8");
    so.addVariable("path", "/packages/ampie/");
    var date = new Date();
    so.addVariable("data_file", encodeURIComponent("/RealTime/" + SymbolId + ".txt"));
    so.addVariable("settings_file", encodeURIComponent("/packages/ampie/settings.xml"));
    so.write('RealtimeChart');
};

basicChartUpdate();
setInterval('basicChartUpdate()', 10000);