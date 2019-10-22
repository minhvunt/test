AV.StockBoard.Menu = AV.extend(AV.Module, {	
	viewCategories: true,
	viewMenu:false,
	drawMainMenu:function() {		
		return AV.template('MainTabs', this);
	},
	draw:function(){
		return AV.template('Menu', this);
	},
	showMenu: function(){
		this.toogle();
		var offset = $('#viewMenu').position();
		$('#sub-menu').css({ left: $('#session-info').left() + 'px', top: ((offset ? offset.top : 0) + 25) + 'px' });
	},
	showCategories: function() {
		this.toogle();
		var offset = $('#viewCategories').position();
		$('#sub-menu1').css({ left: $('#session-info').left() + 'px', top: ((offset ? offset.top : 0) + 25) + 'px' });
	},
	toogle: function(){
		Stock.isShowMenu = true;
		$('#Dialog-StockBoard-Options').hide();
		$('#sub-menu').hide();
		$('#sub-menu1').hide();
	}
});