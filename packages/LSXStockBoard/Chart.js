Stock.Chart = AV.extend(AV.Module, {
    posX: 0,
    posY: 0,
    symbol: '',
    init: function() {
        var that = this;
        AV.Module.prototype.init.call(that);
        that.symbol = AV.LSXStockBoard.currentSymbol;
    },
    setPos: function(x, y) {
        var that = this;
        that.posX = x;
        that.posY = y;

        $('show-chart-menu').css({ 'top': x + 'px', 'left': y + 'px' })
    },
    drawChart: function() {
        TotalSecData();
    },
    draw: function() {
        return AV.template('Chart', this);
    }
});