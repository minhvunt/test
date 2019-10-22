var symbol = '';
var name = '';
var check = false;

function TotalSecData() {
	if(AV.StockBoard.currentSymbol == '')
	{
		$('#realtime-chart').css({'display':'none'});
		return;
	}
    var obj = AV.StockBoard.currentSymbol.split('-');
    if (obj.length > 0) {
		$('#realtime-chart').css({'display':'block'});
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
	
	if(AV.StockBoard.floor=='HO')
		symbol='VNIndex';
	else if(AV.StockBoard.floor=='HA')
		symbol='HASTCIndex';
	else if(AV.StockBoard.floor=='UPCOM')
		symbol='UPCOMIndex';
		
    DrawBasicChart(symbol, 1);
}

function DrawBasicChart(SymbolId, type) {
    
    var so;
	if(type==1)
		so = new SWFObject("/packages/ampie/amline.swf", "amline", "250", "150", "8");
	else
		so = new SWFObject("/packages/ampie/amline.swf", "amline", "350", "200", "8");
    so.addVariable("path", "/packages/ampie/");
    var date = new Date();
    so.addVariable("data_file", encodeURIComponent("/RealTime/" + SymbolId + ".txt"));
	so.addVariable("settings_file", encodeURIComponent("/packages/ampie/settings.xml"));
    so.write('BasicChart');
};

function DrawRealtimeChart(SymbolId, type) {
    
    var so;
	if(type==1)
		so = new SWFObject("/packages/ampie/amline.swf", "amline", "250", "150", "8");
	else
		so = new SWFObject("/packages/ampie/amline.swf", "amline", "350", "200", "8");
    so.addVariable("path", "/packages/ampie/");
    var date = new Date();
    so.addVariable("data_file", encodeURIComponent("/RealTime/" + SymbolId + ".txt"));
	so.addVariable("settings_file", encodeURIComponent("/packages/ampie/settings.xml"));
    so.write('RealtimeChart');
};