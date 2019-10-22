var Chart = AV.StockBoard.Chart = AV.extend(AV.Module, {
    symbol:'',
    rows:null,
    init: function () {
        var that = this;
        AV.load(
            '3rdparty/jQuery/grid/css/ui.jqgrid.css',
            '3rdparty/jQuery/grid/js/i18n/grid.locale-en.js',
            '3rdparty/jQuery/grid/js/jquery.jqGrid.min.js',
            '3rdparty/jQuery/ui/jquery.ui.draggable.min.js'
        );
        
        AV.Module.prototype.init.call(that);
        that.symbol = AV.StockBoard.currentSymbol;
    },
    setPos: function (x, y) {
        var that = this;
        that.posX = x;
        that.posY = y;
        $('show-stock-details').css({ 'top': x + 'px', 'left': y + 'px' })
    },
    draw: function () {
        return AV.template('Chart', this);
    },
    initChartSlider() {
        $('.chart-area').removeClass('is-hidden').slick({
            slidesToShow: 5,
            arrows: false,
            swipeToSlide: true,
            mobileFirst: false,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 5,
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 5,
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 5,
                    }
                }
            ]
        });
    }
});