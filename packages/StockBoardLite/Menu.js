AV.StockBoardLite.Menu = AV.extend(AV.Module, {
	drawMainMenu:function() {		
		return AV.template('MainTabs');
	},
	draw:function(){
		return AV.template('Menu');
	},
	showMenu: function(){
		Stock.isShowMenu = true;
		$('#Dialog-StockBoardLite-Options').hide();
		$('#sub-menu').toggle();
		var offset = $('#top-rightmenu').position();
		$('#sub-menu').css({left:(AV.clientWidth()-$('#sub-menu').width()-18)+'px',top:((offset?offset.top:0)+25)+'px'});
	}
});